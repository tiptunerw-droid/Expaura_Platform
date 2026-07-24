# Functional System Description

## Smart Restaurant Feedback & QR Menu Management Platform

Version: 1.0
Document Type: Functional System Description (FSD)
Product Type: SaaS (Software as a Service)
Target Market: Restaurants, Cafés, Hotels, Fast Food, Coffee Shops in Rwanda

---

## 1. Introduction

### 1.1 Purpose

This document describes the functional requirements of the Smart Restaurant Feedback & QR Menu Management Platform.

The platform enables restaurants to:
- digitize menus
- collect customer feedback
- manage complaints
- analyze customer satisfaction
- improve service quality through a centralized web-based dashboard

The system also provides a public restaurant directory that helps customers discover restaurants across Rwanda.

### 1.2 Overview

The platform is a cloud-based SaaS solution designed to support restaurant operations, customer experience management, and business growth.

## 2. Problem Statement

Restaurants in Rwanda often rely on traditional methods of managing customer experiences, resulting in the following challenges:
- customers leave dissatisfied without informing management
- restaurant managers lack visibility into customer experiences
- poor employee performance goes unnoticed
- printed menus are expensive to update
- small restaurants cannot afford professional websites
- existing review platforms are not integrated into restaurant operations
- restaurants lack customer behavior analytics
- restaurant discovery is fragmented across social media platforms

As a result, restaurants lose customers without understanding the reasons behind their dissatisfaction.

## 3. Proposed Solution

The proposed solution is a restaurant experience management platform that combines:
- QR digital menu
- customer feedback collection
- complaint management
- restaurant analytics
- employee performance tracking
- public restaurant directory
- AI-powered insights

The platform allows restaurants to continuously improve customer satisfaction while giving customers an easier way to discover and interact with restaurants.

## 4. Objectives

The system aims to:
- improve customer satisfaction
- increase restaurant operational efficiency
- reduce menu printing costs
- improve service quality
- increase restaurant online visibility
- help managers make data-driven decisions
- create Rwanda's largest restaurant discovery platform

## 5. Scope

### 5.1 Primary Users
- restaurant owners
- restaurant managers
- supervisors
- staff (future)
- restaurant customers
- visitors

### 5.2 System Coverage
The platform supports:
- restaurant registration and profile management
- digital menu creation and QR code delivery
- customer feedback and complaint management
- analytics and performance tracking
- restaurant discovery and public restaurant pages
- subscription and administration management

## 6. Stakeholders
- restaurant owners
- restaurant managers
- customers
- platform administrators
- customer support team

## 7. Functional Requirements

### Module 1 — Restaurant Registration
The platform shall allow restaurants to:
- create an account
- verify email or phone
- create restaurant profile
- upload logo and cover image
- set opening hours
- add social media links
- enter address and Google Maps coordinates
- choose a subscription plan

### Module 2 — Restaurant Profile Management
Restaurant owners shall be able to edit:
- restaurant name
- description
- logo
- gallery
- address
- phone
- WhatsApp
- email
- website
- categories

Example categories:
- Coffee Shop
- Pizza
- BBQ
- Luxury
- Fast Food

### Module 3 — Digital Menu Management
Restaurant managers shall be able to:
- create menu categories
- create menu items
- update item availability
- mark popular items

Example menu categories:
- Breakfast
- Lunch
- Dinner
- Desserts
- Drinks

Each menu item includes:
- name
- description
- price
- image
- availability
- category
- popular badge

Managers can:
- add items
- edit items
- delete items
- hide unavailable items

### Module 4 — QR Code Management
The system shall generate a unique QR code for every restaurant.

Scanning the QR code should open:
- restaurant profile
- digital menu
- gallery
- opening hours
- location
- contact details
- customer review form

Future functionality may include:
- table reservation
- online ordering

### Module 5 — Customer Review System
Customers can submit:
- overall rating
- food rating
- service rating
- atmosphere rating
- cleanliness rating
- recommendation (yes/no)
- comments
- suggestions

Review submission does not require a customer account.

### Module 6 — Complaint Management
Customers can submit complaints with categories such as:
- food
- waiter
- delay
- cleanliness
- billing
- price
- environment
- other

Optional fields:
- waiter name
- table number
- receipt number

Restaurant managers receive complaints immediately.

Complaint workflow states:
- Pending
- In Progress
- Resolved
- Closed

### Module 7 — Waiter Performance Tracking
Managers can monitor:
- average rating
- positive reviews
- negative reviews
- number of complaints
- most mentioned employees
- service performance trends

This module helps identify high-performing employees and those who need training.

### Module 8 — Analytics Dashboard
Dashboard metrics include:
- customer satisfaction
- average rating
- weekly rating
- monthly rating
- complaint trends
- food ratings
- service ratings
- most popular menu items
- most common complaints
- average resolution time
- peak review hours
- customer recommendation rate
- returning customer percentage (future)

### Module 9 — Public Restaurant Directory
Customers can search restaurants by:
- location
- cuisine
- price range
- restaurant name
- features

Example features:
- outdoor seating
- family friendly
- coffee
- BBQ
- luxury
- fast food

Search results display:
- restaurant card
- rating
- distance
- open/closed status
- menu preview

### Module 10 — Restaurant Page
Each restaurant shall have a public page displaying:
- restaurant information
- menu
- gallery
- ratings
- reviews
- opening hours
- phone number
- WhatsApp
- Google Maps
- social media links
- QR menu
- future reservation button

### Module 11 — AI Review Summary
The system analyzes customer feedback and provides summarized insights.

Example output:
- customers appreciate the grilled chicken and friendly staff
- complaints indicate slow service during weekends

Managers receive actionable summaries instead of manually reading hundreds of reviews.

### Module 12 — Subscription Management
Plans include:
- Free: restaurant profile, QR menu, 10 reviews, basic dashboard
- Standard: unlimited reviews, complaint management, analytics, menu editing, photo gallery
- Premium: everything in Standard plus multiple branches, employee performance, AI insights, marketing campaigns, priority support, featured listing

### Module 13 — Administration Portal
Platform administrators manage:
- restaurants
- subscriptions
- payments
- users
- complaints
- reported reviews
- categories
- cities
- analytics
- system monitoring

## 8. Non-Functional Requirements

### Performance
- pages should load within 3 seconds
- dashboard analytics should refresh in under 5 seconds
- the platform should support thousands of concurrent users

### Security
- HTTPS encryption
- secure authentication
- role-based access control
- data encryption
- audit logs
- GDPR and Rwanda data privacy compliance where applicable

### Scalability
The platform should support:
- multiple restaurants
- multiple cities
- multiple branches
- millions of reviews
- future expansion into East Africa

### Availability
Target uptime: 99.9%

## 9. System Actors

| Actor | Responsibilities |
|-------|------------------|
| Customer | View menu, submit reviews, submit complaints |
| Restaurant Manager | Manage menu, reviews, complaints, analytics |
| Restaurant Owner | Manage business profile and subscription |
| Administrator | Manage the entire platform |

## 10. Future Enhancements
- online ordering
- table reservation
- customer loyalty program
- digital payments
- coupon management
- push notifications
- customer accounts
- restaurant chat
- AI recommendation engine
- multi-language support
- mobile application
- POS integration
