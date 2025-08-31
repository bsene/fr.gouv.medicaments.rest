# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a REST API for the French government's public medication database. It provides access to official pharmaceutical data including medications, compositions, presentations, and administrative information. The API serves data from government files that are automatically downloaded and processed daily.

## Common Development Commands

- `npm start` - Start the production server
- `npm run dev` - Start development server with file watching
- `npm run download-data` - Manually download latest data files
- `npx knip` - Check for unused dependencies and exports
- `docker-compose up -d` - Start containerized version with auto-clone from GitHub

## Architecture

### Core Components

**Entry Point:** `src/server.js`
- Express server initialization
- CORS configuration
- Route mounting at `/api/medicaments`
- Health check endpoint at `/api/health`
- Interactive HTML documentation at root `/`
- Automatic data download and loading on startup

**Data Processing:**
- `src/services/dataDownloader.js` - Downloads TSV files from government source, handles encoding conversion to UTF-8, maintains metadata with 24-hour refresh cycle
- `src/services/dataLoader.js` - Parses TSV files into memory cache, provides search functionality with wildcard support, handles CSV parsing with fallback mechanisms

**API Routes:** `src/routes/medicaments.js`
- RESTful endpoints for different data types
- Pagination support (default 100, max 1000)
- Search with wildcard patterns (* and ?)
- Pretty JSON formatting option
- Enriched responses with related data joins

### Data Files Structure

The API processes these government TSV files:
- `CIS_bdpm.txt` - Main pharmaceutical specialties
- `CIS_CIP_bdpm.txt` - Presentations and packaging
- `CIS_COMPO_bdpm.txt` - Compositions and active substances
- `CIS_HAS_SMR_bdpm.txt` - Medical service value assessments
- `CIS_HAS_ASMR_bdpm.txt` - Therapeutic improvement assessments
- `CIS_GENER_bdpm.txt` - Generic drug groups
- `CIS_CPD_bdpm.txt` - Prescription conditions
- `CIS_CIP_Dispo_Spec.txt` - Availability and supply disruptions
- `CIS_MITM.txt` - Drugs of major therapeutic interest

### API Endpoints Pattern

All endpoints follow this structure:
- Base path: `/api/medicaments/`
- Support query parameters: `q` (search), `page`, `limit`, `pretty`
- Return paginated results with metadata
- Special endpoint `/api/medicaments/specialites/:cis` provides enriched data by joining related information

### Key Features

**Data Management:**
- Automatic daily data refresh from government source
- UTF-8 encoding conversion for all files
- In-memory caching for fast response times
- Fallback to local files if download fails
- Metadata tracking for download times and sources

**Search & Filtering:**
- Wildcard search with `*` (multiple chars) and `?` (single char)
- Field-specific search across relevant columns
- Case-insensitive matching
- Global search endpoint combining multiple data types

**Response Format:**
- Consistent JSON structure with data, pagination, and metadata
- Optional pretty printing with `?pretty=true`
- Rich metadata including last update time and data source attribution

## Environment Variables

- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment mode

## Docker Configuration

The project includes a `docker-compose.yml` that automatically clones the latest version from GitHub and runs in a Node.js Alpine container. This approach ensures the deployed version is always up-to-date without requiring local repository management.

## File Encoding

All data files are automatically converted to UTF-8 during download/processing to ensure proper character handling for French text content.

## API Testing

The project includes Bruno API test collection in the `endpoints/` directory:
- `bruno.json` - Collection configuration for Bruno API client
- `Health Check.bru` - Health endpoint test
- `Spécialités pharmaceutiques.bru` - Pharmaceutical specialties endpoint test

Use Bruno (https://github.com/usebruno/bruno) to run and manage API tests.