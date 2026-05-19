"use server"

import { spawn } from "child_process"

export async function runRfidBridge() {
  const bridgePath = "../../../rfid_bridge"
  return new Promise<{
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
  }>((resolve) => {
    const process = spawn("go", ["run", "main.go", "serve"], {
      cwd: bridgePath,
      shell: false,
    })

    process.on('error', (error) => {
      resolve({
        success: false,
        message: error.message,
        error: error.message,
      })
    })

    let output = ""
    let errorOutput = ""

    process.stdout.on("data", (data) => {
      const text = data.toString()
      output += text
      console.log("[RFID stdout]", text)
    })

    process.stderr.on("data", (data) => {
      const text = data.toString()
      errorOutput += text
      console.error("[RFID stderr]", text)
    })

    process.on("close", (code) => {
      console.log("[RFID close] code:", code)
      console.log("[RFID output completo]:", output)

      const responsePrefix = "RFID_LOGIN_RESPONSE:"
      let token: string | undefined
      let user: { id: number; name: string; role: string; department_id: number } | undefined

      const responseIndex = output.indexOf(responsePrefix)
      if (responseIndex !== -1) {
        const jsonPart = output.substring(responseIndex + responsePrefix.length).trim()
        try {
          const parsed = JSON.parse(jsonPart)
          token = parsed.access_token
          user = parsed.user
        } catch (error) {
          console.error("[RFID parse error]", error)
        }
      }

      if (code !== 0) {
        const message = errorOutput.trim() || output.trim() || "Error al ejecutar el lector RFID"
        resolve({
          success: false,
          message,
          output,
          error: errorOutput,
        })
        return
      }

      if (output.includes("RFID_LOGIN_SUCCESS")) {
        resolve({
          success: true,
          message: "Login RFID exitoso",
          output,
          token,
          user,
        })
        return
      }

      resolve({
        success: false,
        message: "No se confirmó el login con tarjeta RFID/NFC",
        output,
        error: errorOutput,
      })
    })
  })
}