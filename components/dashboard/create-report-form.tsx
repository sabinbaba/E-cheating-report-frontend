"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { FileUpload } from "@/components/ui/file-upload"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { reportsService } from "@/lib/reports"
import { useAuth } from "@/hooks/use-auth"
import { Loader2, FileText, User, Calendar, AlertTriangle, Shield, MapPin, Users, FileCheck } from "lucide-react"
import type { CheatingReport, ReportAttachment } from "@/types/report"

interface CreateReportFormProps {
  onSuccess: () => void
}

interface Witness {
  name: string
  registrationNumber: string
}

export function CreateReportForm({ onSuccess }: CreateReportFormProps) {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [attachments, setAttachments] = useState<ReportAttachment[]>([])
  const [witnesses, setWitnesses] = useState<Witness[]>([{ name: "", registrationNumber: "" }])
  
  const [formData, setFormData] = useState({
    studentName: "",
    studentId: "",
    studentClass: "",
    courseCode: "",
    examName: "",
    examCode: "",
    incidentDate: "",
    incidentTime: "",
    examRoom: "",
    incidentType: "" as CheatingReport["incidentType"],
    cheatingMethod: "", // What was used for cheating (facts)
    description: "",
    priority: "MEDIUM" as CheatingReport["priority"],
    invigilatorName: "",
    invigilatorSignature: "", // This would be handled differently in a real app
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      if (!user) throw new Error("User not authenticated")

      // Filter out empty witnesses
      const validWitnesses = witnesses.filter(w => w.name.trim() && w.registrationNumber.trim())

      const reportData = {
        ...formData,
        witnesses: validWitnesses,
        reportedBy: user.fullName,
        reporterEmail: user.email,
        status: "pending" as const,
        submittedAt: new Date().toISOString(),
      }

      // Create FormData for multipart request
      const formPayload = new FormData()
      formPayload.append("report", JSON.stringify(reportData))

      // Fix: Properly append file attachments
      attachments.forEach((attachment, index) => {
        if (attachment.file instanceof File) {
          formPayload.append(`attachment_${index}`, attachment.file, attachment.name)
        }
      })

      // Call the service with proper parameters
      await reportsService.createReport(formPayload, { headers: { "Content-Type": "multipart/form-data" } }, reportData)

      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create report")
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const addWitness = () => {
    if (witnesses.length < 5) {
      setWitnesses([...witnesses, { name: "", registrationNumber: "" }])
    }
  }

  const removeWitness = (index: number) => {
    if (witnesses.length > 1) {
      setWitnesses(witnesses.filter((_, i) => i !== index))
    }
  }

  const updateWitness = (index: number, field: keyof Witness, value: string) => {
    const updated = witnesses.map((witness, i) => 
      i === index ? { ...witness, [field]: value } : witness
    )
    setWitnesses(updated)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="bg-primary rounded-full p-4">
            <Shield className="h-8 w-8 text-primary-foreground" />
          </div>
        </div>
        <div>
          <h1 className="text-3xl font-bold text-balance text-foreground">Academic Integrity Report</h1>
          <p className="text-muted-foreground text-balance mt-2">
            Submit a comprehensive report for academic misconduct incidents
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Student Information */}
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-xl">
              <User className="h-5 w-5 text-primary" />
              Student Information
            </CardTitle>
            <CardDescription>Provide details about the student involved in the incident</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label htmlFor="studentName" className="text-sm font-medium text-foreground">
                  Student Full Name *
                </Label>
                <Input
                  id="studentName"
                  placeholder="Enter student's full name"
                  value={formData.studentName}
                  onChange={(e) => handleInputChange("studentName", e.target.value)}
                  className="h-11 bg-input border-border/50 focus:border-ring"
                  required
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="studentId" className="text-sm font-medium text-foreground">
                  Student Registration Number *
                </Label>
                <Input
                  id="studentId"
                  placeholder="e.g., 22RP01234"
                  value={formData.studentId}
                  onChange={(e) => handleInputChange("studentId", e.target.value)}
                  className="h-11 bg-input border-border/50 focus:border-ring"
                  required
                />
              </div>
            </div>
            <div className="space-y-3">
              <Label htmlFor="studentClass" className="text-sm font-medium text-foreground">
                Class/Program *
              </Label>
              <Input
                id="studentClass"
                placeholder="e.g., Year 3 Computer Science"
                value={formData.studentClass}
                onChange={(e) => handleInputChange("studentClass", e.target.value)}
                className="h-11 bg-input border-border/50 focus:border-ring"
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Examination Details */}
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-xl">
              <FileCheck className="h-5 w-5 text-secondary" />
              Examination Details
            </CardTitle>
            <CardDescription>Specify the examination information where the incident occurred</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label htmlFor="examName" className="text-sm font-medium text-foreground">
                  Examination Name *
                </Label>
                <Input
                  id="examName"
                  placeholder="e.g., Database Management Systems Final Exam"
                  value={formData.examName}
                  onChange={(e) => handleInputChange("examName", e.target.value)}
                  className="h-11 bg-input border-border/50 focus:border-ring"
                  required
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="examCode" className="text-sm font-medium text-foreground">
                  Examination Code *
                </Label>
                <Input
                  id="examCode"
                  placeholder="e.g., CS301"
                  value={formData.examCode}
                  onChange={(e) => handleInputChange("examCode", e.target.value)}
                  className="h-11 bg-input border-border/50 focus:border-ring"
                  required
                />
              </div>
            </div>
            <div className="space-y-3">
              <Label htmlFor="courseCode" className="text-sm font-medium text-foreground">
                Course/Module *
              </Label>
              <Input
                id="courseCode"
                placeholder="e.g., Database Management Systems"
                value={formData.courseCode}
                onChange={(e) => handleInputChange("courseCode", e.target.value)}
                className="h-11 bg-input border-border/50 focus:border-ring"
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Incident Details */}
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-xl">
              <AlertTriangle className="h-5 w-5 text-secondary" />
              Incident Details
            </CardTitle>
            <CardDescription>Specify the date, time, location, and nature of the academic integrity violation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="space-y-3">
                <Label htmlFor="incidentDate" className="text-sm font-medium text-foreground">
                  Date of Incident *
                </Label>
                <Input
                  id="incidentDate"
                  type="date"
                  value={formData.incidentDate}
                  onChange={(e) => handleInputChange("incidentDate", e.target.value)}
                  className="h-11 bg-input border-border/50 focus:border-ring"
                  required
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="incidentTime" className="text-sm font-medium text-foreground">
                  Time of Incident *
                </Label>
                <Input
                  id="incidentTime"
                  type="time"
                  value={formData.incidentTime}
                  onChange={(e) => handleInputChange("incidentTime", e.target.value)}
                  className="h-11 bg-input border-border/50 focus:border-ring"
                  required
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="examRoom" className="text-sm font-medium text-foreground">
                  Examination Room *
                </Label>
                <Input
                  id="examRoom"
                  placeholder="e.g., Room 101, Block A"
                  value={formData.examRoom}
                  onChange={(e) => handleInputChange("examRoom", e.target.value)}
                  className="h-11 bg-input border-border/50 focus:border-ring"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label className="text-sm font-medium text-foreground">Type of Violation *</Label>
                <Select
                  value={formData.incidentType}
                  onValueChange={(value) => handleInputChange("incidentType", value)}
                >
                  <SelectTrigger className="h-11 bg-input border-border/50 focus:border-ring">
                    <SelectValue placeholder="Select violation type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EXAM_CHEATING">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">Exam</Badge>
                        Examination Cheating
                      </div>
                    </SelectItem>
                    <SelectItem value="ASSIGNMENT_PLAGIARISM">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">Assignment</Badge>
                        Assignment Plagiarism
                      </div>
                    </SelectItem>
                    <SelectItem value="UNAUTHORIZED_COLLABORATION">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">Collaboration</Badge>
                        Unauthorized Collaboration
                      </div>
                    </SelectItem>
                    <SelectItem value="OTHER">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">Other</Badge>
                        Other Violation
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-3">
                <Label className="text-sm font-medium text-foreground">Priority Level</Label>
                <Select value={formData.priority} onValueChange={(value) => handleInputChange("priority", value)}>
                  <SelectTrigger className="h-11 bg-input border-border/50 focus:border-ring">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        Low Priority
                      </div>
                    </SelectItem>
                    <SelectItem value="MEDIUM">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                        Medium Priority
                      </div>
                    </SelectItem>
                    <SelectItem value="HIGH">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-red-500"></div>
                        High Priority
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="cheatingMethod" className="text-sm font-medium text-foreground">
                Cheating Method/Facts *
              </Label>
              <Input
                id="cheatingMethod"
                placeholder="e.g., Mobile phone, written notes, communication with another student"
                value={formData.cheatingMethod}
                onChange={(e) => handleInputChange("cheatingMethod", e.target.value)}
                className="h-11 bg-input border-border/50 focus:border-ring"
                required
              />
              <p className="text-xs text-muted-foreground">
                Describe what was used for cheating or the method observed
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Witnesses */}
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Users className="h-5 w-5 text-chart-1" />
              Witnesses/Testimonies
            </CardTitle>
            <CardDescription>Add witnesses who can provide testimony about the incident</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {witnesses.map((witness, index) => (
              <div key={index} className="space-y-4 p-4 border border-border/50 rounded-lg">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-sm">Witness {index + 1}</h4>
                  {witnesses.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeWitness(index)}
                      className="text-destructive hover:text-destructive"
                    >
                      Remove
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm">Witness Name</Label>
                    <Input
                      placeholder="Enter witness name"
                      value={witness.name}
                      onChange={(e) => updateWitness(index, "name", e.target.value)}
                      className="h-10 bg-input border-border/50 focus:border-ring"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Registration Number</Label>
                    <Input
                      placeholder="Enter registration number"
                      value={witness.registrationNumber}
                      onChange={(e) => updateWitness(index, "registrationNumber", e.target.value)}
                      className="h-10 bg-input border-border/50 focus:border-ring"
                    />
                  </div>
                </div>
              </div>
            ))}
            
            {witnesses.length < 5 && (
              <Button
                type="button"
                variant="outline"
                onClick={addWitness}
                className="w-full h-10 border-dashed border-border/50"
              >
                Add Another Witness
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Invigilator Information */}
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-xl">
              <MapPin className="h-5 w-5 text-accent" />
              Invigilator Information
            </CardTitle>
            <CardDescription>Details of the examination invigilator</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="invigilatorName" className="text-sm font-medium text-foreground">
                Invigilator Name *
              </Label>
              <Input
                id="invigilatorName"
                placeholder="Enter invigilator's full name"
                value={formData.invigilatorName}
                onChange={(e) => handleInputChange("invigilatorName", e.target.value)}
                className="h-11 bg-input border-border/50 focus:border-ring"
                required
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="invigilatorSignature" className="text-sm font-medium text-foreground">
                Invigilator Signature/Confirmation
              </Label>
              <Input
                id="invigilatorSignature"
                placeholder="Digital signature or confirmation code"
                value={formData.invigilatorSignature}
                onChange={(e) => handleInputChange("invigilatorSignature", e.target.value)}
                className="h-11 bg-input border-border/50 focus:border-ring"
              />
              <p className="text-xs text-muted-foreground">
                In a digital system, this could be replaced with digital signature or confirmation
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Description */}
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-xl">
              <FileText className="h-5 w-5 text-accent" />
              Detailed Description
            </CardTitle>
            <CardDescription>
              Provide a comprehensive account of the incident, including context and observations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Label htmlFor="description" className="text-sm font-medium text-foreground">
                Incident Description *
              </Label>
              <Textarea
                id="description"
                placeholder="Provide a detailed description of the incident, including:
• What exactly happened?
• Sequence of events observed
• What evidence was observed?
• Actions taken immediately
• Any additional context or circumstances..."
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                rows={6}
                className="bg-input border-border/50 focus:border-ring resize-none"
                required
              />
              <p className="text-xs text-muted-foreground">
                Be as specific as possible. This information will be used for investigation purposes.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Supporting Evidence */}
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Calendar className="h-5 w-5 text-chart-1" />
              Supporting Evidence
            </CardTitle>
            <CardDescription>
              Upload any supporting documents, images, or files that substantiate the report
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FileUpload
              attachments={attachments}
              onAttachmentsChange={setAttachments}
              maxFiles={5}
              maxSizePerFile={10}
            />
          </CardContent>
        </Card>

        {error && (
          <Alert variant="destructive" className="border-destructive/50">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Card className="border-border/50 shadow-sm">
          <CardContent className="pt-6">
            <div className="bg-muted/50 p-4 rounded-lg mb-4">
              <p className="text-sm text-muted-foreground">
                <strong>Note:</strong> This report should be completed immediately in the examination room where the offense is observed, 
                as per academic integrity protocols. All information provided will be used for official investigation purposes.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onSuccess}
                className="h-11 px-8 border-border/50 bg-transparent"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading} className="h-11 px-8 bg-primary hover:bg-primary/90">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting Report...
                  </>
                ) : (
                  <>
                    <Shield className="mr-2 h-4 w-4" />
                    Submit Report
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}