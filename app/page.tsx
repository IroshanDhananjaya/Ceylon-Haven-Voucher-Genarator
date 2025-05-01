'use client';

import {useEffect, useState} from 'react';
import { saveAs } from 'file-saver';
import fontkit from '@pdf-lib/fontkit';
import { PDFDocument, rgb } from 'pdf-lib';

interface VoucherData {
    bookingId: string;
    client: string;
    checkIn: string;
    checkOut: string;
}

// Helper function to format date in dd/mm/yyyy
const formatDate = (date: string) => {
    if (!date) return ''; // This handles undefined, null, and empty string
    const [year, month, day] = date.split('-');
    if (!year || !month || !day) return ''; // In case it's not a valid date string
    return `${day}/${month}/${year}`;
};


const generatePdf = async (data: VoucherData) => {
    const existingPdfBytes = await fetch('/CEYLON HAVEN_VOUCHER_FINAL.pdf').then(res => res.arrayBuffer());
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    pdfDoc.registerFontkit(fontkit);
    const fontBytes = await fetch('/fonts/Montserrat-Black.ttf').then(res => res.arrayBuffer());
    const montserratFont = await pdfDoc.embedFont(fontBytes);
    const pages = pdfDoc.getPages();
    const firstPage = pages[0];
    const { height } = firstPage.getSize();
    const color = rgb(0.2, 0.282, 0.337);

    const formattedCheckIn = formatDate(data.checkIn);
    const formattedCheckOut = formatDate(data.checkOut);


    firstPage.drawText(data.bookingId, { x: 250, y: height - 97, size: 9, font: montserratFont, color });
    firstPage.drawText(data.client,    { x: 227, y: height - 116.5, size: 9, font: montserratFont, color });
    if (formattedCheckIn) {
        firstPage.drawText(formattedCheckIn, { x: 239, y: height - 158, size: 9, font: montserratFont, color });
    }
    if (formattedCheckOut) {
        firstPage.drawText(formattedCheckOut, { x: 248, y: height - 177, size: 9, font: montserratFont, color });
    }

    return await pdfDoc.save();
};

export default function Home() {
    const [form, setForm] = useState<VoucherData>({
        bookingId: '',
        client: '',
        checkIn: '',
        checkOut: '',
    });

    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setForm({
            ...form,
            [name]: value,
        });
    };

    const handleDateChange = (name: string, date: string) => {
        setForm({
            ...form,
            [name]: date,
        });
    };

    const handlePreview = async () => {
        const pdfBytes = await generatePdf(form);
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        setPreviewUrl(url);
    };

    useEffect(() => {
        void handlePreview()
    },[])

    const handleDownload = async () => {
        const pdfBytes = await generatePdf(form);
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const fileName = `${form.bookingId}.pdf`;  // Use bookingId as the file name
        saveAs(blob, fileName);  // Save the file with the new name
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-sky-200 to-blue-300 p-6 flex flex-col lg:flex-row items-center justify-center gap-8">
            {/* Left - Form */}
            <div className="w-full lg:w-1/2 max-w-md bg-white rounded-2xl shadow-xl p-8">
                <h2 className="text-3xl font-bold text-gray-800 mb-6">Generate Voucher</h2>
                <form className="space-y-6">
                    {[
                        { name: 'bookingId', label: 'Booking ID' },
                        { name: 'client', label: 'Client Name' },
                    ].map(input => (
                        <div key={input.name} className="relative">
                            <input
                                type={input.name === 'checkIn' || input.name === 'checkOut' ? 'text' : 'text'}
                                name={input.name}
                                value={form[input.name as keyof VoucherData]}
                                onChange={handleChange}
                                required
                                className="peer w-full px-3 pt-5 pb-2 text-sm border border-gray-300 rounded-md bg-white text-gray-800 placeholder-transparent focus:outline-none focus:ring-2 focus:ring-blue-400"
                                placeholder={input.label}
                            />
                            <label className="absolute left-3 top-2 text-xs text-gray-500 transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400 peer-focus:top-2 peer-focus:text-xs peer-focus:text-blue-600">
                                {input.label}
                            </label>
                        </div>
                    ))}
                    {/* Check-in Date */}
                    <div className="relative">
                        <input
                            type="date"
                            name="checkIn"
                            value={form.checkIn}
                            onChange={(e) => handleDateChange('checkIn', e.target.value)}
                            required
                            className="peer w-full px-3 pt-5 pb-2 text-sm border border-gray-300 rounded-md bg-white text-gray-800 placeholder-transparent focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                        <label className="absolute left-3 top-2 text-xs text-gray-500 transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400 peer-focus:top-2 peer-focus:text-xs peer-focus:text-blue-600">
                            Check-in Date
                        </label>
                    </div>
                    {/* Check-out Date */}
                    <div className="relative">
                        <input
                            type="date"
                            name="checkOut"
                            value={form.checkOut}
                            onChange={(e) => handleDateChange('checkOut', e.target.value)}
                            required
                            className="peer w-full px-3 pt-5 pb-2 text-sm border border-gray-300 rounded-md bg-white text-gray-800 placeholder-transparent focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                        <label className="absolute left-3 top-2 text-xs text-gray-500 transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400 peer-focus:top-2 peer-focus:text-xs peer-focus:text-blue-600">
                            Check-out Date
                        </label>
                    </div>
                </form>

                <div className="mt-8 flex space-x-4">
                    <button
                        onClick={handlePreview}
                        className="w-1/2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-3 px-6 rounded-lg shadow transition"
                    >
                        Show PDF
                    </button>
                    <button
                        onClick={handleDownload}
                        className="w-1/2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold py-3 px-6 rounded-lg shadow transition"
                    >
                        Download PDF
                    </button>
                </div>
            </div>

            {/* Right - PDF Preview */}
            <div className="w-full lg:w-1/2 h-[85vh] max-w-4xl bg-white rounded-2xl shadow-2xl border border-gray-300 overflow-hidden">
                {previewUrl ? (
                    <iframe src={previewUrl} className="w-full h-full" title="Voucher PDF Preview" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-lg font-medium">
                        PDF preview will appear here
                    </div>
                )}
            </div>
        </div>
    );
}
