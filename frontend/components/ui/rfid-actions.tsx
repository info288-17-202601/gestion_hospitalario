"use server"

import { spawn } from "child_process"

export async function runRfidBridge() {
  const bridgePath =
    "/home/lombrices/Documentos/Sistemas distribuidos/gestion_hospitalario/rfid_bridge"
    const goPath = "../../snap/bin/go"

  return new Promise<{
    success: boolean
    message: string
    output?: string
    error?: string
  }>((resolve) => {
    const process = spawn("go", ["run", "main.go", "--mock"], {
      cwd: bridgePath,
      shell: false,
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

      if (code !== 0) {
        resolve({
          success: false,
          message: "Error al ejecutar el lector RFID",
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