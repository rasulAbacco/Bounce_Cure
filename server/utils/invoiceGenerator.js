// utils/invoiceGenerator.js
import PdfPrinter from "pdfmake";

const fonts = {
    Helvetica: {
        normal: "Helvetica",
        bold: "Helvetica-Bold",
        lineHeight: 1.3,
    },
};

const printer = new PdfPrinter(fonts);

export const generateInvoice = async (payment) => {
    const subtotal = Number(payment.amount || 0);
    const discount = Number(payment.discount || 0);
    const planPrice = Number(payment.planPrice || subtotal);
    const tax = subtotal * 0.1;
    const total = subtotal - discount + tax;

    const docDefinition = {
        background: [
            {
                canvas: [
                    { type: "rect", x: 0, y: 0, w: 595.28, h: 841.89, color: "#000000" },
                ],
            },
            {
                text: "BounceCure",
                color: "#1a1a1a",
                opacity: 0.03,
                bold: true,
                fontSize: 120,
                alignment: "center",
                margin: [0, 0, 0, 4]
            },
        ],
        pageMargins: [40, 40, 40, 40],
        content: [
            // Logo and Header
            {
                columns: [
                    {
                        stack: [
                            {
                                canvas: [
                                    {
                                        type: "ellipse",
                                        x: 32,
                                        y: 32,
                                        r1: 32,
                                        r2: 32,
                                        color: "#0a0a0a",
                                        lineWidth: 2,
                                        lineColor: "#C4A052",
                                    },
                                ],
                                width: 64,
                                height: 64,
                            },
                            {
                                image: "templates/logo.png",
                                width: 40,
                                absolutePosition: { x: 52, y: 52 },
                            },
                        ],
                        width: 90,
                    },
                    {
                        stack: [
                            {
                                text: "BounceCure Invoice",
                                fontSize: 22,
                                bold: true,
                                color: "#C4A052",
                                alignment: "right",
                                margin: [0, 0, 0, 4]
                            },
                            {
                                text: `Invoice #${payment.transactionId || "TXN1756260994381563"}`,
                                fontSize: 10,
                                color: "#ffffff",
                                alignment: "right",
                                margin: [0, 3, 0, 4]
                            },
                            {
                                text: `Date: ${new Date(payment.paymentDate).toLocaleDateString('en-US', {
                                    month: 'numeric',
                                    day: 'numeric',
                                    year: 'numeric'
                                })}. ${new Date(payment.paymentDate).toLocaleTimeString('en-US', {
                                    hour: 'numeric',
                                    minute: '2-digit',
                                    hour12: true
                                })} AM New York`,
                                fontSize: 9,
                                color: "#ffffff",
                                alignment: "right",
                                margin: [0, 2, 0, 5],
                            },
                        ],
                    },
                ],
                margin: [0, 0, 0, 20],
            },

            // Top Border Line
            {
                canvas: [
                    {
                        type: "line",
                        x1: 0,
                        y1: 0,
                        x2: 515,
                        y2: 0,
                        lineWidth: 1,
                        lineColor: "#C4A052",
                    },
                ],
                margin: [0, 0, 0, 20],
            },

            // Issued To and Issued By
            {
                columns: [
                    {
                        stack: [
                            {
                                text: "ISSUED TO:",
                                fontSize: 11,
                                bold: true,
                                color: "#C4A052",
                                margin: [0, 0, 0, 5]
                            },
                            {
                                text: payment.name || "undefined.undefined",
                                fontSize: 11,
                                color: "#FFFFFF",
                                bold: true,
                                margin: [0, 0, 0, 4]
                            },
                            {
                                text: payment.email || "ratnalakcode3@gmail.com",
                                fontSize: 9,
                                color: "#ffffff",
                                margin: [0, 0, 0, 4]
                            },
                            {
                                text: "HMT layout vidyaranyapura Vidyaranyapura Bangalore,",
                                fontSize: 9,
                                color: "#ffffff",
                                margin: [0, 0, 0, 4]
                            },
                            {
                                text: "KA 560094",
                                fontSize: 9,
                                color: "#ffffff",
                                margin: [0, 0, 0, 4]
                            },
                            {
                                text: "Place of Supply: KARNATAKA (29) India",
                                fontSize: 9,
                                color: "#ffffff"
                            },
                        ],
                        width: "48%",
                    },
                    { text: "", width: "4%" },
                    {
                        stack: [
                            {
                                text: "ISSUED BY:",
                                fontSize: 11,
                                bold: true,
                                color: "#C4A052",
                                alignment: "right",
                                margin: [0, 0, 0, 5]
                            },
                            {
                                text: "BounceCure",
                                fontSize: 11,
                                color: "#FFFFFF",
                                bold: true,
                                alignment: "right",
                                margin: [0, 0, 0, 4]
                            },
                            {
                                text: "c/o The Rocket Science Group, LLC",
                                fontSize: 9,
                                color: "#ffffff",
                                alignment: "right",
                                margin: [0, 0, 0, 4]
                            },
                            {
                                text: "405 N. Angier Ave. NE, Atlanta, GA 30212 USA",
                                fontSize: 9,
                                color: "#ffffff",
                                alignment: "right",
                                margin: [0, 0, 0, 4]
                            },
                            {
                                text: "Website: www.bouncecure.com",
                                fontSize: 9,
                                color: "#ffffff",
                                alignment: "right",
                                margin: [0, 0, 0, 4]
                            },
                            {
                                text: "Tax ID: 9922USA29012OSN",
                                fontSize: 11,
                                color: "#ffffff",
                                alignment: "right"
                            },
                        ],
                        width: "48%",
                    },
                ],
                margin: [0, 0, 0, 25],
            },

            // Invoice Details and Payment Summary Row
            {
                columns: [
                    // Invoice Details
                    {
                        stack: [
                            {
                                text: "Invoice Details",
                                fontSize: 13,
                                bold: true,
                                color: "#C4A052",
                                margin: [0, 0, 0, 10]
                            },
                            {
                                table: {
                                    widths: [120, "*"],
                                    body: [
                                        [
                                            { text: "Plan Name", fontSize: 9, color: "#C4A052", border: [true, true, true, true], borderColor: ["#C4A052", "#C4A052", "#C4A052", "#C4A052"] },
                                            { text: payment.planName || "Pro Plan", fontSize: 9, color: "#FFFFFF", alignment: "left", border: [true, true, true, true], borderColor: ["#C4A052", "#C4A052", "#C4A052", "#C4A052"] }
                                        ],
                                        [
                                            { text: "Contacts", fontSize: 9, color: "#C4A052", border: [true, false, true, true], borderColor: ["#C4A052", "#C4A052", "#C4A052", "#C4A052"] },
                                            { text: String(payment.contacts || 5000), fontSize: 9, color: "#FFFFFF", alignment: "left", border: [true, false, true, true], borderColor: ["#C4A052", "#C4A052", "#C4A052", "#C4A052"] }
                                        ],
                                        [
                                            { text: "Discount", fontSize: 9, color: "#C4A052", border: [true, false, true, true], borderColor: ["#C4A052", "#C4A052", "#C4A052", "#C4A052"] },
                                            { text: discount > 0 ? `50% off for 12 months - $${discount.toFixed(2)}` : "No discount", fontSize: 9, color: "#FFFFFF", alignment: "left", border: [true, false, true, true], borderColor: ["#C4A052", "#C4A052", "#C4A052", "#C4A052"] }
                                        ],
                                    ],
                                },
                                layout: {
                                    fillColor: (rowIndex) => "#0a0a0a",
                                    paddingLeft: () => 8,
                                    paddingRight: () => 8,
                                    paddingTop: () => 6,
                                    paddingBottom: () => 6,
                                },
                            },

                            // Payment Information
                            {
                                text: "Payment Information",
                                fontSize: 13,
                                bold: true,
                                color: "#C4A052",
                                margin: [0, 20, 0, 10]
                            },
                            {
                                table: {
                                    widths: [120, "*"],
                                    body: [
                                        [
                                            { text: "Payment Method", fontSize: 9, color: "#C4A052", border: [true, true, true, true], borderColor: ["#C4A052", "#C4A052", "#C4A052", "#C4A052"] },
                                            { text: `${payment.paymentMethod || "Visa"} ending in ${payment.cardLast4 || "4242"} expires ${payment.cardExpiry || "12/30"}`, fontSize: 9, color: "#FFFFFF", alignment: "left", border: [true, true, true, true], borderColor: ["#C4A052", "#C4A052", "#C4A052", "#C4A052"] }
                                        ],
                                        [
                                            { text: "Payment Date", fontSize: 9, color: "#C4A052", border: [true, false, true, true], borderColor: ["#C4A052", "#C4A052", "#C4A052", "#C4A052"] },
                                            { text: new Date(payment.paymentDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }), fontSize: 9, color: "#FFFFFF", alignment: "left", border: [true, false, true, true], borderColor: ["#C4A052", "#C4A052", "#C4A052", "#C4A052"] }
                                        ],
                                        [
                                            {
                                                text: "Next Payment Date",
                                                fontSize: 9,
                                                color: "#C4A052",
                                                border: [true, false, true, true],
                                                borderColor: ["#C4A052", "#C4A052", "#C4A052", "#C4A052"]
                                            },
                                            {
                                                text: (() => {
                                                    function addOneMonth(date) {
                                                        const result = new Date(date);
                                                        result.setMonth(result.getMonth() + 1);
                                                        if (result.getDate() < date.getDate()) {
                                                            result.setDate(0); // fallback to last day of previous month
                                                        }
                                                        return result;
                                                    }

                                                    const paymentDate = new Date(payment.paymentDate);
                                                    return addOneMonth(paymentDate).toLocaleDateString('en-US', {
                                                        month: 'long',
                                                        day: 'numeric',
                                                        year: 'numeric'
                                                    });
                                                })(),
                                                fontSize: 9,
                                                color: "#FFFFFF",
                                                alignment: "left",
                                                border: [true, false, true, true],
                                                borderColor: ["#C4A052", "#C4A052", "#C4A052", "#C4A052"]
                                            }
                                        ],
                                    ],
                                },
                                layout: {
                                    fillColor: () => "#0a0a0a",
                                    paddingLeft: () => 8,
                                    paddingRight: () => 8,
                                    paddingTop: () => 6,
                                    paddingBottom: () => 6,
                                },
                            },
                        ],
                        width: "48%",
                    },
                    { text: "", width: "4%" },

                    // Payment Summary
                    {
                        stack: [
                            {
                                text: "Payment Summary",
                                fontSize: 13,
                                bold: true,
                                color: "#C4A052",
                                margin: [0, 0, 0, 10]
                            },
                            {
                                table: {
                                    widths: [100, "*"],
                                    body: [
                                        [
                                            { text: "Plan Price", fontSize: 9, color: "#C4A052", border: [true, true, true, true], borderColor: ["#C4A052", "#C4A052", "#C4A052", "#C4A052"] },
                                            { text: `$${planPrice.toFixed(2)}`, fontSize: 9, color: "#FFFFFF", alignment: "right", border: [true, true, true, true], borderColor: ["#C4A052", "#C4A052", "#C4A052", "#C4A052"] }
                                        ],
                                        [
                                            { text: "Subtotal", fontSize: 9, color: "#C4A052", border: [true, false, true, true], borderColor: ["#C4A052", "#C4A052", "#C4A052", "#C4A052"] },
                                            { text: `$${subtotal.toFixed(2)}`, fontSize: 9, color: "#FFFFFF", alignment: "right", border: [true, false, true, true], borderColor: ["#C4A052", "#C4A052", "#C4A052", "#C4A052"] }
                                        ],
                                        [
                                            { text: "Discount", fontSize: 9, color: "#C4A052", border: [true, false, true, true], borderColor: ["#C4A052", "#C4A052", "#C4A052", "#C4A052"] },
                                            { text: `-$${discount.toFixed(2)}`, fontSize: 9, color: "#FF6B6B", alignment: "right", border: [true, false, true, true], borderColor: ["#C4A052", "#C4A052", "#C4A052", "#C4A052"] }
                                        ],
                                        [
                                            { text: "Tax (10%)", fontSize: 9, color: "#C4A052", border: [true, false, true, true], borderColor: ["#C4A052", "#C4A052", "#C4A052", "#C4A052"] },
                                            { text: `$${tax.toFixed(2)}`, fontSize: 9, color: "#FFFFFF", alignment: "right", border: [true, false, true, true], borderColor: ["#C4A052", "#C4A052", "#C4A052", "#C4A052"] }
                                        ],
                                    ],
                                },
                                layout: {
                                    fillColor: () => "#0a0a0a",
                                    paddingLeft: () => 8,
                                    paddingRight: () => 8,
                                    paddingTop: () => 6,
                                    paddingBottom: () => 6,
                                },
                            },

                            // Total Box
                            {
                                table: {
                                    widths: [100, "*"],
                                    body: [
                                        [
                                            { text: "TOTAL:", fontSize: 11, bold: true, color: "#C4A052", border: [true, true, true, true], borderColor: ["#C4A052", "#C4A052", "#C4A052", "#C4A052"] },
                                            { text: `$${total.toFixed(2)}`, fontSize: 16, bold: true, color: "#FFD700", alignment: "right", border: [true, true, true, true], borderColor: ["#C4A052", "#C4A052", "#C4A052", "#C4A052"] }
                                        ]
                                    ],
                                },
                                layout: {
                                    fillColor: () => "#1a1200",
                                    paddingLeft: () => 10,
                                    paddingRight: () => 10,
                                    paddingTop: () => 10,
                                    paddingBottom: () => 10,
                                },
                                margin: [0, 12, 0, 0],
                            },
                        ],
                        width: "48%",
                    },
                ],
            },

            // Bottom Border Line
            {
                canvas: [
                    {
                        type: "line",
                        x1: 0,
                        y1: 0,
                        x2: 515,
                        y2: 0,
                        lineWidth: 1,
                        lineColor: "#C4A052",
                    },
                ],
                margin: [0, 80, 0, 15],
            },

            // Footer
            {
                text: "Abacco Technology",
                fontSize: 11,
                color: "#C4A052",
                alignment: "center",
            },
        ],
        defaultStyle: {
            font: "Helvetica",
            color: "#FFFFFF",
        },
    };

    const pdfDoc = printer.createPdfKitDocument(docDefinition);
    const chunks = [];
    return new Promise((resolve, reject) => {
        pdfDoc.on("data", (chunk) => chunks.push(chunk));
        pdfDoc.on("end", () => resolve(Buffer.concat(chunks)));
        pdfDoc.on("error", reject);
        pdfDoc.end();
    });
};