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
import { reportsService } from "@/lib/reports"
import { useAuth } from "@/hooks/use-auth"
import { Loader2, FileText, User, Calendar, AlertTriangle, Shield } from "lucide-react"
import type { CheatingReport, ReportAttachment } from "@/types/report"

interface CreateReportFormProps {
  onSuccess: () => void
}

export function CreateReportForm({ onSuccess }: CreateReportFormProps) {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [attachments, setAttachments] = useState<ReportAttachment[]>([])
  const [formData, setFormData] = useState({
    studentName: "",
    studentId: "",
    course: "",
    incidentDate: "",
    incidentType: "" as CheatingReport["incidentType"],
    description: "",
    priority: "medium" as CheatingReport["priority"],
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      if (!user) {
        throw new Error("User not authenticated")
      }

      const reportData = {
        ...formData,
        reportedBy: user.name,
        reporterEmail: user.email,
        status: "pending" as const,
        attachments: attachments.length > 0 ? attachments : undefined,
      }

      reportsService.createReport(reportData)
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
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-xl">
              <AlertTriangle className="h-5 w-5 text-secondary" />
              Incident Details
            </CardTitle>
            <CardDescription>Specify the course, date, and nature of the academic integrity violation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label htmlFor="course" className="text-sm font-medium text-foreground">
                  Course/Module *
                </Label>
                <Input
                  id="course"
                  placeholder="e.g., Database Management Systems"
                  value={formData.course}
                  onChange={(e) => handleInputChange("course", e.target.value)}
                  className="h-11 bg-input border-border/50 focus:border-ring"
                  required
                />
              </div>
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
                    <SelectItem value="exam_cheating">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          Exam
                        </Badge>
                        Examination Cheating
                      </div>
                    </SelectItem>
                    <SelectItem value="assignment_plagiarism">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          Assignment
                        </Badge>
                        Assignment Plagiarism
                      </div>
                    </SelectItem>
                    <SelectItem value="unauthorized_collaboration">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          Collaboration
                        </Badge>
                        Unauthorized Collaboration
                      </div>
                    </SelectItem>
                    <SelectItem value="other">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          Other
                        </Badge>
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
                    <SelectItem value="low">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        Low Priority
                      </div>
                    </SelectItem>
                    <SelectItem value="medium">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                        Medium Priority
                      </div>
                    </SelectItem>
                    <SelectItem value="high">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-red-500"></div>
                        High Priority
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

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
• When and where did it occur?
• What evidence was observed?
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
