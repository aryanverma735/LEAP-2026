"use client"

import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { getEmployeeData } from "@/app/utils/excelData"

export default function SubmissionForm() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    ideaId: "",
    associateDomainId: "",
    associateName: "",
    function: "",
    teamLead: "",
    functionalManager: "",
    state: "",
    applicationName: "",
    specifyApplicationName: "",
    ideaName: "",
    problemStatement: "",
    solution: "",
    savingsType: "",
    savingsComment: "",
    submissionDateTime: "",
  })

  useEffect(() => {
    const generateUniqueIdeaId = () => {
      const timestamp = Date.now().toString(36)
      const randomStr = Math.random().toString(36).substring(2, 7)
      return `IDEA-${timestamp}-${randomStr}`.toUpperCase()
    }

    setFormData((prev) => ({ ...prev, ideaId: generateUniqueIdeaId() }))
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prevState) => ({ ...prevState, [name]: value }))

    if (name === "associateDomainId") {
      const employeeData = getEmployeeData(value)
      if (employeeData) {
        setFormData((prev) => ({
          ...prev,
          associateName: employeeData.associateName,
          function: employeeData.function,
          teamLead: employeeData.teamLead,
          functionalManager: employeeData.functionalLeader,
        }))
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const submissionData = {
        ...formData,
        submissionDateTime: new Date().toISOString(),
      }

      // Call the new API instead of Firebase
      const response = await fetch("/api/ideas/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submissionData),
      })

      if (!response.ok) {
        throw new Error("Failed to submit idea")
      }

      router.push("/submission-success")
    } catch (error) {
      console.error("Error submitting idea:", error)
      alert("Error submitting idea. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-8 rounded-t-2xl">
        {/* ...existing header code... */}
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-b-2xl shadow-xl p-8 space-y-8">
        {/* ...existing form fields... */}
      </form>
    </div>
  )
}