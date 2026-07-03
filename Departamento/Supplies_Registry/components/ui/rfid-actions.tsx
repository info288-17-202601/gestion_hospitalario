"use server"

import { spawn } from "child_process"
import path from "path"

type RfidBridgeResult = {
  success: boolean
  message: string
  output?: string
  error?: string
  token?: string
  user?: {
    id: number
    name: string
    role: string
    department_id: number
  }
}

function extractLoginResponse(fullOutput: string): {
  token?: string
  user?: {
    id: number
    name: string
    role: string
    department_id: number
  }
} {
  const responsePrefix = "RFID_LOGIN_RESPONSE:"

  const responseLine = fullOutput
    .split("\n")
    .find((line) => line.startsWith(responsePrefix))

  if (!responseLine) return {}

  const jsonPart = responseLine.replace(responsePrefix, "").trim()

  try {
    const parsed = JSON.parse(jsonPart)

    return {
      token: parsed.access_token,
      user: parsed.user,
    }
  } catch (error) {
    console.error("[RFID parse error]", error)
    return {}
  }
}

function getFriendlyMessage(fullOutput: string, code: number | null): string {
  if (
    code === 2 ||
    fullOutput.includes("RFID_INVALID_CREDENTIALS") ||
    fullOutput.includes("Status: 401") ||
    fullOutput.includes("invalid credentials")
  ) {
    return "Tarjeta o contraseña inválida. Verifica tus credenciales e intenta nuevamente."
  }

  if (
    code === 1 ||
    fullOutput.includes("RFID_READER_NOT_CONNECTED") ||
    fullOutput.includes("RFID_CONNECTION_TIMEOUT") ||
    fullOutput.includes("RFID_SERIAL_ERROR") ||
    fullOutput.includes("RFID_SERIAL_CLOSED") ||
    fullOutput.includes("No esta conectado el lector") ||
    fullOutput.includes("No está conectado el lector") ||
    fullOutput.includes("permission denied")
  ) {
    return "El lector RFID/NFC no está conectado o no se pudo leer. Revisa el lector y vuelve a intentar."
  }

  if (
    code === 3 ||
    fullOutput.includes("RFID_BACKEND_ERROR") ||
    fullOutput.includes("connection refused") ||
    fullOutput.includes("no such host") ||
    fullOutput.includes("i/o timeout")
  ) {
    return "No se pudo validar la tarjeta con el servidor central."
  }

  return "No se pudo completar el login con tarjeta RFID/NFC."
}

export async function runRfidBridge(): Promise<RfidBridgeResult> {
  const bridgePath = path.resolve(process.cwd(), "../rfid_bridge")
  const bridgeBinary = "./rfid_bridge"

  return new Promise<RfidBridgeResult>((resolve) => {
    let stdout = ""
    let stderr = ""
    let timeout: ReturnType<typeof setTimeout> | null = null
    let resolved = false

    const finish = (result: RfidBridgeResult) => {
      if (resolved) return
      resolved = true

      if (timeout) {
        clearTimeout(timeout)
        timeout = null
      }

      resolve(result)
    }

    const child = spawn(bridgeBinary, ["serve"], {
      cwd: bridgePath,
      shell: false,
      env: {
        ...process.env,
      },
    })

    const cleanup = () => {
      if (timeout) {
        clearTimeout(timeout)
        timeout = null
      }

      if (!child.killed) {
        child.kill()
      }
    }

    child.on("error", (error) => {
      cleanup()

      finish({
        success: false,
        message:
          "No se pudo ejecutar el lector RFID/NFC. Verifica que el bridge esté compilado.",
        error: error.message,
      })
    })

    timeout = setTimeout(() => {
      cleanup()

      finish({
        success: false,
        message: "Tiempo agotado. No se detectó una autenticación RFID/NFC.",
        output: stdout,
        error: stderr,
      })
    }, 61000)

    const checkOutput = () => {
      const fullOutput = `${stdout}\n${stderr}`

      if (fullOutput.includes("RFID_LOGIN_SUCCESS")) {
        const { token, user } = extractLoginResponse(fullOutput)
        finish({
          success: true,
          message: "Login RFID exitoso.",
          output: fullOutput,
          token,
          user,
        })
        cleanup()
        return
      }

      if (
        fullOutput.includes("RFID_INVALID_CREDENTIALS") ||
        fullOutput.includes("RFID_BACKEND_ERROR") ||
        fullOutput.includes("RFID_READER_NOT_CONNECTED") ||
        fullOutput.includes("RFID_CONNECTION_TIMEOUT")
      ) {
        finish({
          success: false,
          message: getFriendlyMessage(fullOutput, null),
          output: stdout,
          error: stderr,
        })
        cleanup()
      }
    }

    child.stdout.on("data", (data) => {
      const text = data.toString()
      stdout += text
      console.log("[RFID stdout]", text)
      checkOutput()
    })

    child.stderr.on("data", (data) => {
      const text = data.toString()
      stderr += text
      console.error("[RFID stderr]", text)
      checkOutput()
    })

    child.on("close", (code) => {
      if (timeout) {
        clearTimeout(timeout)
        timeout = null
      }

      const fullOutput = `${stdout}\n${stderr}`

      console.log("[RFID close] code:", code)
      console.log("[RFID stdout completo]:", stdout)
      console.log("[RFID stderr completo]:", stderr)

      const { token, user } = extractLoginResponse(fullOutput)

      if (code === 0 || fullOutput.includes("RFID_LOGIN_SUCCESS")) {
        finish({
          success: true,
          message: "Login RFID exitoso.",
          output: fullOutput,
          token,
          user,
        })

        return
      }

      finish({
        success: false,
        message: getFriendlyMessage(fullOutput, code),
        output: stdout,
        error: stderr,
      })
    })
  })
}