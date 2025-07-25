# PowerShell script to update CHANGELOG.md with git commit history
# This script generates a formatted changelog from git history

param(
    [string]$OutputFile = "CHANGELOG.md",
    [int]$CommitLimit = 50
)

Write-Host "Updating CHANGELOG.md with recent commit history..." -ForegroundColor Green

# Get git log with formatted output
$gitLog = git log --oneline -n $CommitLimit --pretty=format:"- **%h** %s *(%an)*"

# Create changelog header
$changelogContent = @"
# Changelog

All notable changes to the MarieCare Doctor Appointment System will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## Project History

### Recent Updates
$($gitLog -join "`n")

---

## Features Overview

### Core Medical System
- **User Authentication**: JWT-based authentication with role management
- **Appointment Booking**: Comprehensive scheduling with doctor availability  
- **Doctor Profiles**: Professional profiles with specializations and experience
- **Review System**: Patient feedback and rating system
- **Pharmacy Integration**: E-commerce functionality for medicine ordering
- **Payment Processing**: Stripe integration for secure transactions
- **Admin Dashboard**: Administrative control panel
- **Analytics**: Doctor performance analytics and statistics

### Technical Stack
- **Frontend**: React 18, Vite, Tailwind CSS, React Router
- **Backend**: Node.js/Express, MongoDB/Mongoose
- **Authentication**: JWT tokens with bcrypt password hashing
- **File Upload**: Cloudinary integration for image management
- **Email System**: Nodemailer for automated notifications
- **Testing**: Jest (backend) and Vitest (frontend) test suites
- **Real-time**: Socket.IO for booking notifications

### Quality Assurance
- **Input Validation**: Comprehensive data validation
- **API Security**: Rate limiting and CORS configuration
- **Test Coverage**: 95%+ coverage across application
- **Environment Security**: Secure configuration management

Generated on: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
"@

# Write to changelog file
$changelogContent | Out-File -FilePath $OutputFile -Encoding UTF8

Write-Host "CHANGELOG.md updated successfully!" -ForegroundColor Green
Write-Host "File location: $(Resolve-Path $OutputFile)" -ForegroundColor Yellow
