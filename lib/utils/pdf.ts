import RNPrint from 'react-native-print';
import Share from 'react-native-share';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import RNFS from 'react-native-fs';
import {Alert, Platform} from 'react-native';

export type PDFGenerationOptions = {
    htmlContent: string;
    fileName?: string;
    directory?: string;
};

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

export async function printPDF(options: PDFGenerationOptions): Promise<void> {
    try {
        const filePath = await generatePDF(options);
        await RNPrint.print({filePath});
    } catch (error) {
        Alert.alert('Print Error', (error as Error).message);
    }
}

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
