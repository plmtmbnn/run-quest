# RunQuest Design System

Version: 1.0.0

Status: Approved

Owner: Founder

---

# Purpose

This document defines the visual language of RunQuest.

The goal is to ensure every screen feels like it belongs to the same product.

Consistency is more important than creativity.

Whenever multiple design solutions exist, this document should guide the decision.

---

# Design Philosophy

RunQuest is designed to feel:

* Friendly
* Premium
* Calm
* Playful
* Modern
* Lightweight

The interface should encourage players to think, not overwhelm them with information.

Every screen should have one primary goal.

---

# Design Inspiration

RunQuest combines inspiration from:

* Nintendo Switch UI
* Linear
* Headspace
* Duolingo
* The provided dashboard reference

The goal is **not** to copy these products.

The goal is to create a recognizable identity for RunQuest.

---

# Design Principles

## Simplicity First

Every screen should answer one question.

Never show more information than necessary.

---

## One Primary Action

Each page has exactly one primary CTA.

Examples:

Home → Start Today's Race

Preparation → Begin Race

Result → Share Result

---

## White Space Is a Feature

Do not fill empty space unnecessarily.

Breathing room improves readability.

---

## Rounded Everything

The UI should feel approachable.

Avoid sharp corners.

---

## Friendly, Not Childish

Illustrations and emojis are welcome.

The product should still feel premium.

---

# Color System

## Primary

Blue

HEX

#2563EB

Usage

Primary buttons

Links

Highlights

Focus states

---

## Accent

Orange

HEX

#FB923C

Usage

Energy

Important events

Race alerts

Callouts

---

## Success

Green

HEX

#16A34A

Usage

Successful choices

Completed races

Positive feedback

---

## Warning

Amber

HEX

#FBBF24

Usage

Weather

Fatigue

Risk

---

## Danger

Red

HEX

#EF4444

Usage

Failure

Critical events

Negative outcomes

---

## Background

Warm White

HEX

#FFFDF8

Never use pure white (#FFFFFF) as the application background.

---

## Surface

HEX

#FFFFFF

Used for cards and dialogs.

---

## Border

HEX

#E5E7EB

Cards use visible borders.

Border is part of the identity.

---

# Typography

Heading

Space Grotesk

Weight

600–700

Purpose

Titles

Hero sections

Statistics

---

Body

Inter

Weight

400–500

Purpose

Everything else

---

Scale

Display

48

H1

36

H2

30

H3

24

H4

20

Body

16

Small

14

Caption

12

---

# Border Radius

Buttons

9999px

Inputs

9999px

Cards

24px

Dialogs

32px

Badges

9999px

Avatars

Circle

Maintain consistency throughout the application.

---

# Borders

Cards use:

2px subtle border

Soft shadow

Example

Border

rgba(0,0,0,0.08)

Shadow

0 8px 24px rgba(0,0,0,0.08)

The border is part of the visual identity.

---

# Shadows

Shadow should communicate depth.

Never use heavy shadows.

Three levels only:

Small

Medium

Large

---

# Layout

Desktop

Maximum content width

1440px

Centered

Large spacing

---

Mobile

Primary target device

Single-column layout

Bottom spacing for thumb reach

---

# Grid

Use an 8-point spacing system.

Available spacing:

4

8

12

16

24

32

40

48

64

96

Avoid arbitrary spacing values.

---

# Motion

Animation should support understanding.

Never distract.

Duration

Fast

150ms

Normal

250ms

Slow

400ms

Use:

Fade

Slide

Scale

Small bounce

Avoid:

Spinning

Flash

Long transitions

---

# Icons

Primary

Lucide React

Support

Emoji

Future

Custom illustrations

Icons should communicate meaning instantly.

---

# Illustration Style

Illustrations should be:

Minimal

Friendly

Rounded

Flat

Warm

Use illustrations sparingly.

They should reinforce emotion rather than decorate the interface.

---

# Cards

Cards are the primary UI container.

Rules

Rounded

Bordered

Soft shadow

Generous padding

One purpose per card

Cards should not contain excessive nested sections.

---

# Buttons

Primary

Filled Blue

Rounded

Medium height

---

Secondary

White

Border

Rounded

---

Ghost

Transparent

No border

Used only for secondary interactions.

---

# Inputs

Rounded

Large touch target

Simple placeholder

No unnecessary icons

---

# Status Colors

Blue

Information

Green

Success

Amber

Warning

Red

Danger

Gray

Neutral

Never invent additional semantic colors.

---

# Dashboard Philosophy

RunQuest is **not** a data dashboard.

It is a daily experience.

Information should be revealed progressively.

Home should answer only:

"What is today's challenge?"

---

# Screen Hierarchy

Home

↓

Daily Briefing

↓

Preparation

↓

Race

↓

Result

↓

Share

The player should always know the next step.

---

# Responsive Strategy

Design mobile-first.

Desktop enhances the experience.

Never design desktop first.

---

# Accessibility

Minimum touch target

44px

Keyboard navigation supported

High color contrast

Reduced motion respected

Visible focus states required

Accessibility is a requirement, not an enhancement.

---

# Component Library

Shared UI Components

Button

Card

Badge

Avatar

Progress

Separator

Dialog

Tooltip

Skeleton

Sheet

Toast

Hero

Empty State

Loading

Stat

Metric

Section

Page

Every screen should be composed from these shared components.

---

# Dark Mode

Supported from day one.

Default theme

Light

Alternative

Dark

System preference respected.

---

# Design Rules

Never hardcode colors.

Always use design tokens.

Never hardcode spacing.

Always use spacing scale.

Never invent new shadows.

Never invent new radius values.

Never use more than one primary CTA per screen.

Prefer composition over custom layouts.

Consistency beats originality.

---

# AI Design Rules

When generating UI:

* Use shadcn/ui components whenever possible.
* Prefer Card-based layouts.
* Keep pages visually light.
* Maintain generous spacing.
* Use only approved colors.
* Respect typography scale.
* Avoid visual noise.
* Mobile-first by default.
* Explain major UI trade-offs before redesigning.

---

# Visual Identity Statement

RunQuest should feel like opening a beautifully designed board game every morning.

It should invite curiosity, reward thoughtful decisions, and make players excited to discover today's challenge.
