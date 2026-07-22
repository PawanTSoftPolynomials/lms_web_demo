// Mock Data for Orange Tree LMS Enterprise Admin Dashboard
// Provides realistic operational data for enterprise university/corporate training LMS

export const initialAdminData = {
  systemAlerts: [
    {
      id: "alt-1",
      type: "critical",
      title: "Storage Reaching Capacity",
      message: "Media storage server (us-east-1) at 89.4% usage limit. Video transcoding queue affected.",
      actionText: "Expand Volume",
      actionType: "system_storage",
      time: "10m ago"
    },
    {
      id: "alt-2",
      type: "warning",
      title: "Email Service Latency Spike",
      message: "Transactional email delivery queues experiencing 14m average delay via SendGrid SMTP relay.",
      actionText: "Check Relay Queue",
      actionType: "system_email",
      time: "24m ago"
    },
    {
      id: "alt-3",
      type: "warning",
      title: "High Student Dropout Risk Detected",
      message: "AI model flagged 18 students in 'Advanced Data Science 301' with sudden activity drop (>12 days offline).",
      actionText: "Review Student Risk",
      actionType: "ai_risk",
      time: "1h ago"
    }
  ],

  pendingApprovals: {
    totalPending: 48,
    lastUpdated: "Just now",
    items: [
      {
        id: "app-1",
        category: "Course Approval",
        title: "Enterprise Cybersecurity Governance & Risk",
        requestedBy: "Dr. Aris Thorne",
        priority: "High",
        time: "12m ago",
        details: "14 modules, 42 video lectures, 6 lab environments prepared for review."
      },
      {
        id: "app-2",
        category: "Instructor Application",
        title: "Senior Lecturer Application - AI & ML Department",
        requestedBy: "Prof. Elena Rostova",
        priority: "Urgent",
        time: "34m ago",
        details: "PhD from MIT, 12 years industry experience, credentials verified."
      },
      {
        id: "app-3",
        category: "Certificate Verification",
        title: "Executive Leadership Mastery Certificate Batch #4",
        requestedBy: "Corporate Portal Admin",
        priority: "Normal",
        time: "1h ago",
        details: "17 graduate certificates awaiting digital signature and blockchain hash confirmation."
      },
      {
        id: "app-4",
        category: "Enrollment Request",
        title: "Bulk Cohort Enrollment: 45 Engineers (TechCorp Inc.)",
        requestedBy: "Enterprise License Manager",
        priority: "High",
        time: "2h ago",
        details: "Subscription seat allocation and LMS SSO mapping required."
      },
      {
        id: "app-5",
        category: "Refund Request",
        title: "Refund Request: Student #ST-8902 ($499.00)",
        requestedBy: "Support Tier 2",
        priority: "Normal",
        time: "3h ago",
        details: "Reason: Duplicate purchase during institutional transfer window."
      },
      {
        id: "app-6",
        category: "Publishing Request",
        title: "Global Curriculum Update v4.2 - BioMed 101",
        requestedBy: "Faculty Dean",
        priority: "Urgent",
        time: "4h ago",
        details: "Curriculum change affects 420 active enrolled students."
      }
    ]
  },

  todaysOperations: {
    today: [
      { id: "op-1", time: "11:30 AM", title: "Live Workshop: Cloud Architecture & DevOps", instructor: "Marcus Vance", attendees: 184, type: "Live Session" },
      { id: "op-2", time: "02:00 PM", title: "Mid-Term Exam Deadline: Microeconomics 201", enrolled: 310, status: "Active Submissions", type: "Quiz Deadline" },
      { id: "op-3", time: "04:30 PM", title: "Quarterly Faculty Alignment Meeting", attendees: 42, type: "Instructor Meeting" },
      { id: "op-4", time: "11:00 PM", title: "DB Cluster Scheduled Index Maintenance", duration: "30 mins", impact: "Zero Downtime", type: "Maintenance" }
    ],
    tomorrow: [
      { id: "op-5", time: "09:00 AM", title: "New Cohort Orientation: Fall 2026", enrolled: 520, type: "Live Session" },
      { id: "op-6", time: "05:00 PM", title: "Assignment #3 Due: Neural Networks & PyTorch", enrolled: 245, type: "Assignment Deadline" }
    ],
    upcoming: [
      { id: "op-7", time: "Jul 25, 10:00 AM", title: "System Major Upgrade v5.4 Deployment", impact: "Low Impact", type: "Maintenance" },
      { id: "op-8", time: "Jul 28, 12:00 PM", title: "Semester Final Exam Registration Window Closes", type: "Academic Deadline" }
    ]
  },

  messagesSupport: {
    unreadCount: 14,
    items: [
      { id: "msg-1", sender: "Marcus Vance (Instructor)", role: "Instructor", subject: "Lab environment setup failing for Cloud Arch course", priority: "Urgent", time: "8m ago", unread: true },
      { id: "msg-2", sender: "Sophia Martinez (Student)", role: "Student", subject: "Unable to access proctored quiz due to browser extension error", priority: "Urgent", time: "19m ago", unread: true },
      { id: "msg-3", sender: "TechCorp Enterprise Admin", role: "Corporate Client", subject: "SSO SAML 2.0 Certificate renewal notification", priority: "High", time: "45m ago", unread: true },
      { id: "msg-4", sender: "LMS Automation Bot", role: "System", subject: "Payment Webhook retry failed for 4 transactions", priority: "Normal", time: "2h ago", unread: false }
    ]
  },

  courseManagement: {
    attentionCount: 12,
    courses: [
      { id: "c-101", title: "Advanced Enterprise Cybersecurity", instructor: "Dr. Aris Thorne", status: "Pending Approval", students: 0, reports: 0, lastUpdated: "12m ago" },
      { id: "c-102", title: "Full-Stack System Architecture", instructor: "Unassigned", status: "Missing Instructor", students: 142, reports: 2, lastUpdated: "1h ago" },
      { id: "c-103", title: "Quantum Computing Foundations", instructor: "Prof. Sarah Lin", status: "Content Flagged", students: 89, reports: 5, lastUpdated: "3h ago" },
      { id: "c-104", title: "Corporate Compliance & Ethics 2026", instructor: "David Miller", status: "Draft Backlog", students: 0, reports: 0, lastUpdated: "1d ago" }
    ]
  },

  instructorManagement: {
    attentionCount: 8,
    instructors: [
      { id: "ins-1", name: "Prof. Elena Rostova", dept: "AI & ML", status: "Application Pending", courses: 0, rating: "New", lastActive: "34m ago" },
      { id: "ins-2", name: "Dr. Robert Chen", dept: "Data Science", status: "Inactive (30+ Days)", courses: 3, rating: "4.8 / 5", lastActive: "32 days ago" },
      { id: "ins-3", name: "Amanda Hayes", dept: "Business & Strategy", status: "Low Engagement Alert", courses: 2, rating: "3.9 / 5", lastActive: "4 hours ago" },
      { id: "ins-4", name: "Jason Wu", dept: "DevOps Engineering", status: "Missing Schedule", courses: 1, rating: "4.7 / 5", lastActive: "1 day ago" }
    ]
  },

  studentManagement: {
    attentionCount: 23,
    students: [
      { id: "st-1", name: "Alex Rivera", email: "a.rivera@university.edu", status: "Behind Schedule (-3 wks)", course: "Cybersecurity 101", lastActive: "14d ago" },
      { id: "st-2", name: "Kavya Patel", email: "k.patel@techcorp.com", status: "Payment Failed ($299)", course: "Executive Leadership", lastActive: "2d ago" },
      { id: "st-3", name: "Liam O'Connor", email: "liam.oc@student.edu", status: "Certificate On Hold", course: "Data Science Specialization", lastActive: "3h ago" },
      { id: "st-4", name: "Zeynep Yilmaz", email: "z.yilmaz@globalnet.org", status: "Reported for Plagiarism Flag", course: "Ethics in Tech", lastActive: "5h ago" }
    ]
  },

  systemHealth: {
    overall: "Healthy",
    uptime: "99.98%",
    services: [
      { name: "Authentication (OAuth & SAML)", status: "Healthy", latency: "14ms", uptime: "100%" },
      { name: "PostgreSQL Database Cluster", status: "Healthy", latency: "8ms", load: "34%" },
      { name: "AWS S3 Asset & Video Storage", status: "Warning", usage: "89.4%", message: "Storage quota notice" },
      { name: "HLS Video Streaming Server Node", status: "Healthy", latency: "42ms", activeStreams: 1420 },
      { name: "SendGrid SMTP Email Service", status: "Warning", queueDelay: "14m", deliveryRate: "94.2%" },
      { name: "WebSocket Realtime Notifications", status: "Healthy", latency: "6ms", connectedClients: 3240 },
      { name: "Stripe & Invoice Payment Gateway", status: "Healthy", statusText: "Operational", errorRate: "0.01%" },
      { name: "REST & GraphQL API Gateways", status: "Healthy", avgRps: "1,240 req/s", errors: "0" }
    ]
  },

  aiInsights: [
    {
      id: "ai-1",
      title: "Student Dropout Risk Spike",
      description: "18 students in 'Data Science 301' show 78% probability of dropping out due to submission gaps.",
      actionText: "Review Student Report",
      actionType: "student_risk_report",
      impact: "High Impact"
    },
    {
      id: "ai-2",
      title: "Assignment Grading Backlog Alert",
      description: "42 ungraded submissions in 'Cybersecurity 202' exceed the 42-hour target resolution SLA.",
      actionText: "Notify Instructors",
      actionType: "notify_instructors",
      impact: "Operational SLA"
    },
    {
      id: "ai-3",
      title: "Payment Failures Today",
      description: "4 recurring subscription renewals failed today due to expired card tokens.",
      actionText: "Review Failed Transactions",
      actionType: "review_payments",
      impact: "Revenue Protection"
    },
    {
      id: "ai-4",
      title: "CDN Edge Bandwidth Optimization",
      description: "Video transcoding queue can save 28% CDN bandwidth by switching default encoding to H.265 profile.",
      actionText: "Apply Encoding Rule",
      actionType: "apply_encoding",
      impact: "Cost Optimization"
    }
  ],

  enrollmentCenter: {
    pendingRequests: 14,
    manualRequests: 6,
    rejectedRequests: 2,
    bulkQueueCount: 3,
    waitingListCount: 89,
    recentRequests: [
      { id: "en-101", student: "Rachel Green", course: "Machine Learning Masterclass", type: "Manual Request", date: "20m ago", department: "Computer Science" },
      { id: "en-102", student: "TechCorp Engineers Cohort (45)", course: "Corporate Cyber Resilience", type: "Bulk Enterprise", date: "1h ago", department: "Enterprise Enterprise" },
      { id: "en-103", student: "Dmitri Volkov", course: "Cloud Microservices Architecture", type: "Waiting List Escalation", date: "3h ago", department: "Software Engineering" }
    ]
  },

  certificateCenter: {
    awaitingApproval: 17,
    generatedToday: 142,
    verificationRequests: 8,
    rejectedCertificates: 3,
    recentCertificates: [
      { id: "cert-901", recipient: "Samantha Vance", title: "Certified DevSecOps Practitioner", issueDate: "Today, 10:15 AM", status: "Awaiting Verification", hash: "0x8f3b...91a2" },
      { id: "cert-902", recipient: "Carlos Mendoza", title: "Enterprise Leadership Management", issueDate: "Today, 09:40 AM", status: "Approved & Issued", hash: "0x4e2c...11b8" },
      { id: "cert-903", recipient: "Ananya Roy", title: "Advanced Quantum Computing", issueDate: "Yesterday", status: "Manual Override Needed", hash: "Pending Signature" }
    ]
  },

  financeCenter: {
    failedTransactions: 4,
    pendingRefunds: 3,
    revenueToday: "$18,450.00",
    subscriptionRenewals: 84,
    expiredPlans: 7,
    recentTransactions: [
      { id: "tx-401", user: "Kavya Patel", type: "Renewal", amount: "$299.00", status: "Card Declined", time: "1h ago", method: "Stripe Card **** 4120" },
      { id: "tx-402", user: "Enterprise Client #12", type: "Invoice Payment", amount: "$12,500.00", status: "Paid", time: "2h ago", method: "ACH Wire Transfer" },
      { id: "tx-403", user: "Dr. Aris Thorne", type: "Refund Request", amount: "$499.00", status: "Pending Admin Sign-off", time: "4h ago", method: "Original Payment Source" }
    ]
  },

  recentActivity: {
    today: [
      { id: "act-1", time: "11:20 AM", user: "Admin (You)", userAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80", action: "Approved Course: Enterprise Cybersecurity Governance", category: "Course", details: "Published to global enterprise catalog." },
      { id: "act-2", time: "10:45 AM", user: "Prof. Elena Rostova", userAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80", action: "Submitted Senior Instructor Credentials", category: "Instructor", details: "Application queued for verification." },
      { id: "act-3", time: "09:30 AM", user: "System Automation", userAvatar: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80", action: "Issued 142 Graduation Digital Certificates", category: "Certificate", details: "Sent via automated blockchain email dispatch." },
      { id: "act-4", time: "08:15 AM", user: "Finance Service", userAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80", action: "Received ACH Wire Payment ($12,500.00)", category: "Finance", details: "Invoice #INV-2026-88 paid by TechCorp." }
    ],
    yesterday: [
      { id: "act-5", time: "Yesterday, 06:40 PM", user: "Admin (You)", userAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80", action: "Published Institutional Announcement", category: "Announcement", details: "Titled: Maintenance Window Notice for Fall Exam Term." },
      { id: "act-6", time: "Yesterday, 02:15 PM", user: "Support Manager", userAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80", action: "Resolved High Priority Student Ticket #ST-991", category: "Support", details: "Proctoring extension conflict fixed." }
    ],
    earlier: [
      { id: "act-7", time: "Jul 20, 2026", user: "DevOps Automation", userAvatar: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80", action: "System Update v5.3.8 Deployed Cleanly", category: "System", details: "Zero downtime deployment across all regional nodes." }
    ]
  },

  analyticsSummaries: [
    { title: "12 Courses Needing Review", subtitle: "Average queue wait time: 4.2 hours", category: "Courses", metric: "12 Pending", status: "Warning", linkText: "View Review Queue" },
    { title: "Most Active Instructor", subtitle: "Dr. Aris Thorne (94 hrs student engagement this week)", category: "Instructors", metric: "Dr. Aris Thorne", status: "Healthy", linkText: "View Faculty Report" },
    { title: "Most Active Students", subtitle: "Top cohort: CS Senior Year (98.4% assignment completion)", category: "Students", metric: "CS Senior Cohort", status: "Healthy", linkText: "View Student Leaderboard" },
    { title: "Trending Course", subtitle: "Enterprise Cybersecurity (+310 enrollments in 7 days)", category: "Trending", metric: "+310 Enrollments", status: "Healthy", linkText: "View Course Analytics" },
    { title: "Inactive Courses Alert", subtitle: "4 courses with 0 student activity in 45 days", category: "Courses", metric: "4 Inactive", status: "Warning", linkText: "View Inactive Catalog" },
    { title: "Most Difficult Topics", subtitle: "Module 4: Memory Safety & Pointers (62% retry rate)", category: "Curriculum", metric: "Module 4 (62% Fail)", status: "Critical", linkText: "View Syllabus Diagnostics" },
    { title: "Completion Trends", subtitle: "Quarterly completion up by +12.4% vs previous term", category: "Performance", metric: "+12.4% Completion", status: "Healthy", linkText: "View Completion Report" }
  ]
};
