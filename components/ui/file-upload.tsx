"use client"

import type React from "react"
import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X, Upload, ImageIcon, File } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { ReportAttachment } from "@/types/report"

interface FileUploadProps {
  attachments: ReportAttachment[]
  onAttachmentsChange: (attachments: ReportAttachment[]) => void
  maxFiles?: number
  maxSizePerFile?: number // in MB
  acceptedTypes?: string[]
}

export function FileUpload({
  attachments,
  onAttachmentsChange,
  maxFiles = 5,
  maxSizePerFile = 10,
  acceptedTypes = ["image/*", ".pdf", ".doc", ".docx", ".txt"],
}: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState("")

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setError("")

    if (attachments.length + files.length > maxFiles) {
      setError(`Maximum ${maxFiles} files allowed`)
      return
    }

    const newAttachments: ReportAttachment[] = []

    for (const file of files) {
      if (file.size > maxSizePerFile * 1024 * 1024) {
        setError(`File "${file.name}" exceeds ${maxSizePerFile}MB limit`)
        continue
      }

      try {
        const base64 = await fileToBase64(file)
        const attachment: ReportAttachment = {
          id: crypto.randomUUID(),
          name: file.name,
          type: file.type,
          size: file.size,
          data: base64,
          uploadedAt: new Date().toISOString(),
        }
        newAttachments.push(attachment)
      } catch (err) {
        setError(`Failed to process file "${file.name}"`)
      }
    }

    onAttachmentsChange([...attachments, ...newAttachments])

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = (error) => reject(error)
    })
  }

  const removeAttachment = (id: string) => {
    onAttachmentsChange(attachments.filter((att) => att.id !== id))
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) return <ImageIcon className="h-4 w-4" />
    return <File className="h-4 w-4" />
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Evidence Attachments</Label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
          <p className="text-sm text-gray-600 mb-2">Click to upload files or drag and drop</p>
          <p className="text-xs text-gray-500 mb-4">
            Max {maxFiles} files, {maxSizePerFile}MB each. Supports images, PDF, Word docs
          </p>
          <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
            Choose Files
          </Button>
          <Input
            ref={fileInputRef}
            type="file"
            multiple
            accept={acceptedTypes.join(",")}
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {attachments.length > 0 && (
        <div className="space-y-2">
          <Label>
            Uploaded Files ({attachments.length}/{maxFiles})
          </Label>
          <div className="space-y-2">
            {attachments.map((attachment) => (
              <div key={attachment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  {getFileIcon(attachment.type)}
                  <div>
                    <p className="text-sm font-medium">{attachment.name}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(attachment.size)}</p>
                  </div>
                </div>
                <Button type="button" variant="ghost" size="sm" onClick={() => removeAttachment(attachment.id)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
