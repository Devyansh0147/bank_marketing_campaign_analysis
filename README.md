# Bank Marketing Campaign Analytics Platform

An interactive data analytics platform designed to help banking marketing teams evaluate campaign performance, analyze customer segments, and understand subscription outcomes using historical marketing data.

## Overview

The Bank Marketing Campaign Analytics Platform transforms raw campaign data into meaningful business insights through interactive dashboards, data visualization, customer segmentation, and campaign performance analysis.

Built as a major project in data analytics, the platform aims to support data-driven marketing decisions and improve the understanding of customer response patterns.

## Key Features

- **Interactive Dashboard:** View campaign KPIs and subscription statistics.
- **Campaign Analysis:** Compare response rates across campaign attributes and contact methods.
- **Customer Segmentation:** Analyze subscription outcomes across customer demographics and other available attributes.
- **CSV Data Upload:** Import and explore compatible bank marketing datasets.
- **Data Explorer:** Search, filter, inspect, and export campaign records.
- **Data Validation:** Detect missing values, invalid records, and incompatible data formats.
- **Visual Analytics:** Explore trends and patterns through interactive charts.
- **Insights and Recommendations:** Present evidence-based observations derived from the loaded dataset.
- **Testing and Validation:** Verify analytics calculations, data processing, and application behavior.

## Technology Stack

- **Frontend:** React, TypeScript
- **Styling:** Tailwind CSS
- **Data Visualization:** Interactive charting library
- **Data Processing:** CSV parsing and analytical functions
- **Testing:** Automated tests using the project's configured testing framework
- **Development Platform:** Lovable AI
- **Version Control:** Git and GitHub

*Update this section if the final implementation uses additional technologies or different libraries.*

## Dataset

The project uses bank marketing campaign data containing customer attributes, campaign contact information, and subscription outcomes.

Depending on the selected dataset, available fields may include:

- Age, occupation, marital status, and education
- Contact method and campaign month
- Number of campaign contacts
- Previous campaign history
- Subscription outcome

The application should calculate its metrics from the currently loaded dataset rather than relying on hardcoded values.

## Key Performance Indicators

The platform can analyze the following metrics:

| Metric | Description |
|---|---|
| Total Records | Number of records in the loaded dataset |
| Successful Subscriptions | Number of valid records with a positive subscription outcome |
| Subscription Rate | Successful subscriptions divided by records with valid outcomes |
| Campaign Contacts | Contact frequency and related campaign attributes |
| Segment Response Rate | Subscription rate for
