import RNPrint from 'react-native-print';
import Share from 'react-native-share';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import RNFS from 'react-native-fs';
import {Alert, Platform} from 'react-native';

/**
 * Options for generating a PDF file.
 * @property {string} htmlContent - The HTML content to convert to PDF.
 * @property {string} [fileName] - The name of the generated PDF file.
 * @property {string} [directory] - The directory where the PDF file will be saved.
 */
export type PDFGenerationOptions = {
    htmlContent: string;
    fileName?: string;
    directory?: string;
};

/**
 * Generates a PDF file from the provided HTML content.
 * @param {PDFGenerationOptions} options - The options for generating the PDF.
 * @returns {Promise<string>} A promise that resolves to the file path of the generated PDF.
 */
async function generatePDF({htmlContent, fileName = 'generated-file', directory = 'Documents'}: PDFGenerationOptions): Promise<string> {
    try {
        const options = {
            html: htmlContent,
            fileName,
            directory,
        };

        const file = await RNHTMLtoPDF.convert(options);
        if (!file.filePath) {
            throw new Error('Failed to generate PDF file.');
        }

        return file.filePath;
    } catch (error) {
        console.error('Error generating PDF:', error);
        throw error;
    }
}

/**
 * Prints a PDF file generated from the provided options.
 * @param {PDFGenerationOptions} options - The options for generating the PDF.
 * @returns {Promise<void>} A promise that resolves when the PDF is printed.
 */
export async function printPDF(options: PDFGenerationOptions): Promise<void> {
    try {
        const filePath = await generatePDF(options);
        await RNPrint.print({filePath});
    } catch (error) {
        Alert.alert('Print Error', (error as Error).message);
    }
}

/**
 * Shares a PDF file generated from the provided options.
 * @param {PDFGenerationOptions} options - The options for generating the PDF.
 * @returns {Promise<void>} A promise that resolves when the PDF is shared.
 */
export async function sharePDF(options: PDFGenerationOptions): Promise<void> {
    try {
        const filePath = await generatePDF(options);
        await Share.open({
            title: 'Send PDF',
            url: `file://${filePath}`,
            type: 'application/pdf',
            failOnCancel: false,
        });
    } catch (error) {
        Alert.alert('Share Error', (error as Error).message);
    }
}

/**
 * Saves a PDF file generated from the provided options to the device.
 * @param {PDFGenerationOptions} options - The options for generating the PDF.
 * @returns {Promise<string | null>} A promise that resolves to the file path of the saved PDF, or null if an error occurs.
 */
export async function savePDF(options: PDFGenerationOptions): Promise<string | null> {
    try {
        const tempFilePath = await generatePDF(options);
        const fileName = `${options.fileName ?? 'generated-file'}.pdf`;

        // Determine destination path
        const destPath = Platform.OS === 'android' ? `${RNFS.DownloadDirectoryPath}/${fileName}` : `${RNFS.DocumentDirectoryPath}/${fileName}`; // iOS: no native Downloads, best is Documents

        // Copy file to destination
        await RNFS.copyFile(tempFilePath, destPath);

        Alert.alert('PDF Saved', `File saved at:\n${destPath}`);
        return destPath;
    } catch (error) {
        Alert.alert('Save Error', (error as Error).message);
        return null;
    }
}

export {generatePDF};
