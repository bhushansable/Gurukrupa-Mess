# Gurukrupa Mess - Tiffin Delivery App PRD

## Overview
Full-stack cross-platform mobile app for Gurukrupa Mess, a tiffin/mess food delivery business in India. Built with React Native (Expo) + FastAPI + MongoDB.

## Business Model
- **Single Tiffin**: ₹80 per meal (Dal + Rice + Roti + Sabzi + Salad)
- **Weekly Plan**: ₹490 (7 days, 1 meal/day)
- **Monthly Plan**: ₹1800 (30 days, 1 meal/day) - Best Value
- **Monthly 2-Meals**: ₹3200 (30 days, 2 meals/day)

## Demo Accounts
- **Customer**: rahul@test.com / test123
- **Admin**: admin@gurukrupa.com / admin123

## Tech Stack
- **Frontend**: React Native (Expo SDK 54, expo-router)
- **Backend**: FastAPI (Python)
- **Database**: MongoDB
- **Auth**: JWT (email + password)
- **Payment**: Mock Razorpay (ready for real integration)

## Features Implemented

### Customer Features
- [x] JWT Authentication (login/register)
- [x] Home screen with daily menu & ordering CTA
- [x] Weekly menu with day selector (English + Marathi)
- [x] Subscription plans with mock payment
- [x] Single tiffin ordering (₹80)
- [x] Order history with status tracking
- [x] Order detail with live status steps
- [x] User profile with edit capability
- [x] English/Marathi language toggle
- [x] Support page with WhatsApp & Call buttons
- [x] FAQ section

### Admin Features (Role-based)
- [x] Admin dashboard with stats (orders, revenue, customers)
- [x] Order management with status updates
- [x] Menu management (add/delete items)
- [x] Customer list view
- [x] Switch between admin/user views

### Backend APIs
- Auth: register, login, profile, update
- Menu: CRUD, weekly view, day filter
- Plans: CRUD
- Orders: create, list, status update, detail
- Subscriptions: create, list
- Admin: dashboard stats, customer list
- Payment: mock Razorpay

## Design
- **Theme**: Warm Terracotta (#C2410C) + Off-White (#FFFCF8)
- **Language**: English + Marathi support
- **Navigation**: Bottom tabs (customer) + Admin tabs

## Mocked
- Razorpay payment (always succeeds) - ready for real API keys

## Future Enhancements
- Real Razorpay integration
- Push notifications
- Delivery tracking with maps
- Order export (CSV/PDF)
- Analytics dashboard
- Dine-in table reservation system
