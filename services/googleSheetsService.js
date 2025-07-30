const { google } = require('googleapis');
const config = require('../config/config');

class GoogleSheetsService {
    constructor() {
        this.sheets = null;
        this.spreadsheetId = config.googleSheets.spreadsheetId;
        this.sheetNames = config.googleSheets.sheetNames;
        
        // Debug logging
        if (config.server.environment === 'development') {
            console.log('🔧 Google Sheets Service Configuration:');
            console.log('- Spreadsheet ID:', this.spreadsheetId ? 'Set' : 'Missing');
            console.log('- Service Account Email:', config.googleSheets.clientEmail ? 'Set' : 'Missing');
            console.log('- Private Key:', config.googleSheets.privateKey ? 'Set' : 'Missing');
        }
        
        this.init();
    }

    async init() {
        try {

            // Clean and format the private key
            // Create JWT client for service account authentication
            const auth = new google.auth.JWT({
                email: config.googleSheets.clientEmail,
                key: config.googleSheets.privateKey,
                scopes: [
                    'https://www.googleapis.com/auth/spreadsheets',
                    'https://www.googleapis.com/auth/drive.readonly'
                ]
            });

            // Authorize the client first
            await auth.authorize();
            
            if (config.server.environment === 'development') {
                console.log('✅ Google Sheets authentication successful');
            }

            // Initialize the sheets API
            this.sheets = google.sheets({ version: 'v4', auth });
            
            if (config.server.environment === 'development') {
                console.log('✅ Google Sheets service initialized successfully');
            }
        } catch (error) {
            console.error('❌ Failed to initialize Google Sheets service:', error.message);
            throw error;
        }
    }

    // Generic method to read data from a sheet
    async readSheet(sheetName, range = null) {
        try {
            const fullRange = range ? `${sheetName}!${range}` : sheetName;
            const response = await this.sheets.spreadsheets.values.get({
                spreadsheetId: this.spreadsheetId,
                range: fullRange,
            });

            const rows = response.data.values || [];
            if (rows.length === 0) {
                return { headers: [], data: [] };
            }

            const headers = rows[0];
            const data = rows.slice(1).map(row => {
                const obj = {};
                headers.forEach((header, index) => {
                    obj[header] = row[index] || '';
                });
                return obj;
            });

            return { headers, data };
        } catch (error) {
            console.error(`Error reading sheet ${sheetName}:`, error.message);
            throw new Error(`Failed to read sheet: ${error.message}`);
        }
    }

    // Generic method to append data to a sheet
    async appendToSheet(sheetName, values) {
        try {
            const response = await this.sheets.spreadsheets.values.append({
                spreadsheetId: this.spreadsheetId,
                range: sheetName,
                valueInputOption: 'USER_ENTERED',
                insertDataOption: 'INSERT_ROWS',
                resource: {
                    values: [values]
                }
            });

            return response.data;
        } catch (error) {
            console.error(`Error appending to sheet ${sheetName}:`, error.message);
            throw new Error(`Failed to append data: ${error.message}`);
        }
    }

    // Generic method to update data in a sheet
    async updateSheet(sheetName, range, values) {
        try {
            const response = await this.sheets.spreadsheets.values.update({
                spreadsheetId: this.spreadsheetId,
                range: `${sheetName}!${range}`,
                valueInputOption: 'USER_ENTERED',
                resource: {
                    values: [values]
                }
            });

            return response.data;
        } catch (error) {
            console.error(`Error updating sheet ${sheetName}:`, error.message);
            throw new Error(`Failed to update data: ${error.message}`);
        }
    }

    // Generic method to delete a row from a sheet
    async deleteRow(sheetName, rowIndex) {
        try {
            // First, get the sheet ID
            const sheetMetadata = await this.sheets.spreadsheets.get({
                spreadsheetId: this.spreadsheetId
            });

            const sheet = sheetMetadata.data.sheets.find(s => s.properties.title === sheetName);
            if (!sheet) {
                throw new Error(`Sheet ${sheetName} not found`);
            }

            const sheetId = sheet.properties.sheetId;

            // Delete the row
            const response = await this.sheets.spreadsheets.batchUpdate({
                spreadsheetId: this.spreadsheetId,
                resource: {
                    requests: [{
                        deleteDimension: {
                            range: {
                                sheetId: sheetId,
                                dimension: 'ROWS',
                                startIndex: rowIndex,
                                endIndex: rowIndex + 1
                            }
                        }
                    }]
                }
            });

            return response.data;
        } catch (error) {
            console.error(`Error deleting row from sheet ${sheetName}:`, error.message);
            throw new Error(`Failed to delete row: ${error.message}`);
        }
    }

    // Method to find a row by a specific column value
    async findRowByValue(sheetName, columnName, value) {
        try {
            const { headers, data } = await this.readSheet(sheetName);
            const columnIndex = headers.indexOf(columnName);
            
            if (columnIndex === -1) {
                throw new Error(`Column ${columnName} not found in sheet ${sheetName}`);
            }

            const rowIndex = data.findIndex(row => row[columnName] === value);
            return rowIndex !== -1 ? { rowIndex: rowIndex + 1, data: data[rowIndex] } : null; // +1 because headers are row 0
        } catch (error) {
            console.error(`Error finding row in sheet ${sheetName}:`, error.message);
            throw error;
        }
    }

    // Method to get sheet metadata
    async getSheetInfo() {
        try {
            const response = await this.sheets.spreadsheets.get({
                spreadsheetId: this.spreadsheetId
            });

            return {
                title: response.data.properties.title,
                sheets: response.data.sheets.map(sheet => ({
                    title: sheet.properties.title,
                    sheetId: sheet.properties.sheetId,
                    gridProperties: sheet.properties.gridProperties
                }))
            };
        } catch (error) {
            console.error('Error getting sheet info:', error.message);
            throw new Error(`Failed to get sheet info: ${error.message}`);
        }
    }
}

module.exports = new GoogleSheetsService();
