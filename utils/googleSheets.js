const { google } = require('googleapis');
const fs = require('fs');

const auth = new google.auth.GoogleAuth({
    keyFile: '../nithra-jobs-site-59bcf9b2bdfd.json', // Replace with the path to your credentials file
    scopes: ['https://www.googleapis.com/auth/spreadsheets', 'https://www.googleapis.com/auth/drive'],
});

const sheets = google.sheets({ version: 'v4', auth });

const addRowToSheet = async (spreadsheetId, sheetName, rowData) => {
    try {
        const response = await sheets.spreadsheets.values.append({
            spreadsheetId,
            range: `${sheetName}!A1`, // Assumes your sheet starts at A1
            valueInputOption: 'USER_ENTERED',
            resource: {
                values: [rowData],
            },
        });
        console.log(`Row added to ${sheetName}:`, response.data);
    } catch (error) {
        console.error('Error adding row to sheet:', error);
    }
};

const createSheetForService = async (spreadsheetId, sheetName) => {
    try {
        const response = await sheets.spreadsheets.batchUpdate({
            spreadsheetId,
            resource: {
                requests: [
                    {
                        addSheet: {
                            properties: {
                                title: sheetName,
                            },
                        },
                    },
                ],
            },
        });
        console.log(`Sheet created for service: ${sheetName}`);
    } catch (error) {
        if (error.code === 400 && error.message.includes('already exists')) {
            console.log(`Sheet ${sheetName} already exists.`);
        } else {
            console.error('Error creating sheet:', error);
        }
    }
};

module.exports = { addRowToSheet, createSheetForService };
