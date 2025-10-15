// server/utils/printInvoiceGen.js
import PdfPrinter from "pdfmake";

const currencySymbols = {
    USD: "$",
    EUR: "€",
    GBP: "£",
    INR: "₹",
    AUD: "A$",
    CAD: "C$",
    JPY: "¥",
    NZD: "NZ$",
    NOK: "kr",
    SEK: "kr",
    CHF: "CHF",
};

const formatCurrency = (value, currencyCode) => {
    const code = (currencyCode || "USD").toUpperCase();
    const symbol = currencySymbols[code] || "$";

    if (code === "INR") return "INR " + Number(value).toFixed(2);

    try {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: code,
        }).format(value);
    } catch {
        return `${symbol}${Number(value).toFixed(2)}`;
    }
};

const fonts = {
    Helvetica: {
        normal: "Helvetica",
        bold: "Helvetica-Bold",
    },
};

const printer = new PdfPrinter(fonts);

export const generatePrintingInvoice = async (payment) => {
    const paymentAmount = Number(((payment.amount / 11) * 10) + payment.discount).toFixed(2);
    const planPrice = paymentAmount;
    const discount = Number(payment.discount || 0);
    const taxRate = 0.1;

    const subtotal = Number((planPrice - discount).toFixed(2));
    const tax = Number((subtotal * taxRate).toFixed(2));
    const total = Number((subtotal + tax).toFixed(2));

    const currencyCode = (payment.currency || "USD").toUpperCase();
    const billingAddressLines = payment.billingAddress ? payment.billingAddress.split(",") : [];

    const docDefinition = {
        pageMargins: [50, 50, 50, 80],
        content: [
            // HEADER
            {
                columns: [
                    {
                        stack: [
                            {
                                canvas: [
                                    {
                                        type: "ellipse",
                                        x: 35,
                                        y: 35,
                                        r1: 35,
                                        r2: 35,
                                        color: "#FFFFFF",
                                        lineWidth: 1,
                                        lineColor: "#000000",
                                    },
                                ],
                                width: 70,
                                height: 70,
                            },
                            {
                                image: "templates/logo.png",
                                width: 55,
                                absolutePosition: { x: 58, y: 58 },
                            },
                        ],
                        width: 100,
                    },
                    {
                        stack: [
                            {
                                text: "BounceCure Invoice",
                                fontSize: 22,
                                bold: true,
                                color: "#000000",
                                alignment: "right",
                                margin: [0, 0, 0, 6],
                            },
                            {
                                text: `Invoice #${payment.transactionId || "TXN0001"}`,
                                fontSize: 10,
                                color: "#000000",
                                alignment: "right",
                                marginBottom: 3,
                            },
                            {
                                text: `Date: ${new Date(payment.paymentDate).toLocaleDateString(
                                    "en-US",
                                    { month: "numeric", day: "numeric", year: "numeric" }
                                )} ${new Date(payment.paymentDate).toLocaleTimeString("en-US", {
                                    hour: "numeric",
                                    minute: "2-digit",
                                    hour12: true,
                                })} EST`,
                                fontSize: 9,
                                color: "#000000",
                                alignment: "right",
                            },
                        ],
                    },
                ],
                margin: [0, 0, 0, 25],
            },

            // ISSUED TO / BY
            {
                columns: [
                    {
                        stack: [
                            { text: "ISSUED TO:", fontSize: 11, bold: true, color: "#000000", margin: [0, 0, 0, 5] },
                            { text: payment.name || "Customer Name", fontSize: 11, bold: true, color: "#000000", margin: [0, 0, 0, 3] },
                            { text: payment.email || "customer@email.com", fontSize: 9, color: "#000000", margin: [0, 0, 0, 3] },
                            ...billingAddressLines.map(line => ({
                                text: line.trim(),
                                fontSize: 9,
                                color: "#000000",
                                margin: [0, 0, 0, 2],
                            })),
                        ],
                        width: "48%",
                    },
                    { text: "", width: "4%" },
                    {
                        stack: [
                            { text: "Issued By:", fontSize: 11, bold: true, color: "#000000", alignment: "right", margin: [0, 0, 0, 5] },
                            { text: "BounceCure", fontSize: 11, bold: true, color: "#000000", alignment: "right", margin: [0, 0, 0, 6] },

                            { text: "c/o Abacco Technologies LLC", fontSize: 9, color: "#000000", alignment: "right", margin: [0, 0, 0, 2] },
                            { text: "3524 Silverside Road, Suite 35B", fontSize: 9, color: "#000000", alignment: "right", margin: [0, 0, 0, 2] },
                            { text: "Wilmington, DE 19810-4929, USA", fontSize: 9, color: "#000000", alignment: "right", margin: [0, 0, 0, 8] },

                            { text: "Abacco Technology", fontSize: 9, bold: true, color: "#000000", alignment: "right", margin: [0, 0, 0, 2] },
                            { text: "3rd Floor, 12-4.13, 12A, J.B. Kaval", fontSize: 9, color: "#000000", alignment: "right", margin: [0, 0, 0, 2] },
                            { text: "Major Sandeep Unnikrishnan Road,", fontSize: 9, color: "#000000", alignment: "right", margin: [0, 0, 0, 2] },
                            { text: "Adityanagar, Vidyaranyapura, Bangalore 560097", fontSize: 9, color: "#000000", alignment: "right", margin: [0, 0, 0, 8] },

                            { text: "Website: www.bouncecure.com", fontSize: 9, color: "#000000", alignment: "right", margin: [0, 0, 0, 2] },
                            { text: "GST Number: 9922USA29012OSN", fontSize: 9, color: "#000000", alignment: "right" },
                        ],

                        width: "48%",
                    },
                ],
                margin: [0, 0, 0, 25],
            },

            // INVOICE DETAILS
            { text: "Invoice Details", fontSize: 13, bold: true, color: "#000000", margin: [0, 0, 0, 10] },
            {
                table: {
                    widths: ["35%", "*"],
                    body: [
                        [{ text: "Plan Name", fontSize: 10, color: "#000000" }, { text: payment.planName || "Standard", fontSize: 10, alignment: "right", color: "#000000" }],
                        [{ text: "Contacts", fontSize: 10, color: "#000000" }, { text: String(payment.contacts || 0), fontSize: 10, alignment: "right", color: "#000000" }],
                        [{ text: "Discount", fontSize: 10, color: "#000000" }, { text: discount > 0 ? `-${formatCurrency(discount, currencyCode)}` : "No discount", fontSize: 10, alignment: "right", color: "#000000" }],
                    ],
                },
                layout: {
                    hLineColor: () => "#cccccc",
                    vLineColor: () => "#cccccc",
                    paddingTop: () => 5,
                    paddingBottom: () => 5,
                },
                margin: [0, 0, 0, 25],
            },

            // PAYMENT SUMMARY
            { text: "Payment Summary", fontSize: 13, bold: true, color: "#000000", margin: [0, 0, 0, 10] },
            {
                table: {
                    widths: ["35%", "*"],
                    body: [
                        [{ text: "Plan Price", fontSize: 10, color: "#000000" }, { text: formatCurrency(planPrice, currencyCode), fontSize: 10, alignment: "right", color: "#000000" }],
                        [{ text: "Discount", fontSize: 10, color: "#000000" }, { text: discount > 0 ? `- ${formatCurrency(discount, currencyCode)}` : "No discount", fontSize: 10, alignment: "right", color: "#000000" }],
                        [{ text: "Subtotal", fontSize: 10, color: "#000000" }, { text: formatCurrency(subtotal, currencyCode), fontSize: 10, alignment: "right", color: "#000000" }],
                        [{ text: "Tax (10%)", fontSize: 10, color: "#000000" }, { text: formatCurrency(tax, currencyCode), fontSize: 10, alignment: "right", color: "#000000" }],
                        [{ text: "Total", fontSize: 11, bold: true, color: "#000000" }, { text: formatCurrency(total, currencyCode), fontSize: 11, bold: true, alignment: "right", color: "#000000" }],
                    ],
                },
                layout: {
                    hLineColor: () => "#cccccc",
                    vLineColor: () => "#cccccc",
                    paddingTop: () => 5,
                    paddingBottom: () => 5,
                },
                margin: [0, 0, 0, 25],
            },

            // PAYMENT INFORMATION
            { text: "Payment Information", fontSize: 13, bold: true, color: "#000000", margin: [0, 0, 0, 10] },
            {
                table: {
                    widths: ["35%", "*"],
                    body: [
                        [{ text: "Payment Method", fontSize: 10, color: "#000000" }, { text: `${payment.paymentMethod || "Visa"} ending in ${payment.cardLast4 || "4242"}}`, fontSize: 10, alignment: "right", color: "#000000" }],
                        [{ text: "Payment Date", fontSize: 10, color: "#000000" }, { text: new Date(payment.paymentDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }), fontSize: 10, alignment: "right", color: "#000000" }],
                        [{ text: "Next Payment Date", fontSize: 10, color: "#000000" }, { text: payment.nextPaymentDate ? new Date(payment.nextPaymentDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "N/A", fontSize: 10, alignment: "right", color: "#000000" }],
                    ],
                },
                layout: {
                    hLineColor: () => "#cccccc",
                    vLineColor: () => "#cccccc",
                    paddingTop: () => 5,
                    paddingBottom: () => 5,
                },
            },
        ],
        footer: {
            stack: [
                {
                    canvas: [
                        { type: "line", x1: 50, y1: 0, x2: 545, y2: 0, lineWidth: 1, lineColor: "#000000" },
                    ],
                    margin: [0, 0, 0, 5],
                },
                {
                    text: "Abacco Technology",
                    alignment: "center",
                    color: "#000000",
                    fontSize: 10,
                    margin: [0, 10, 0, 0],
                },
            ],
        },
        defaultStyle: { font: "Helvetica" },
    };

    const pdfDoc = printer.createPdfKitDocument(docDefinition);
    const chunks = [];
    return new Promise((resolve, reject) => {
        pdfDoc.on("data", (chunk) => chunks.push(chunk));
        pdfDoc.on("end", () => resolve(Buffer.concat(chunks)));
        pdfDoc.on("error", (err) => reject(err));
        pdfDoc.end();
    });
};
