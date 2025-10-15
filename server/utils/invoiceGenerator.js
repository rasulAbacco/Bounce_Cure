// utils/invoiceGenerator.js
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

export const generateInvoice = async (payment) => {
    const paymentAmount = Number(((payment.amount / 11) * 10) + payment.discount).toFixed(2);
    const planPrice = paymentAmount;
    const discount = Number(payment.discount || 0);
    const taxRate = 0.1;

    const subtotal = Number((planPrice - discount).toFixed(2));
    const tax = Number((subtotal * taxRate).toFixed(2));
    const total = Number((subtotal + tax).toFixed(2));

    const currencyCode = (payment.currency || "USD").toUpperCase();

    const billingAddressLines = payment.billingAddress
        ? payment.billingAddress.split(",")
        : [];

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
            },
        ],
        pageMargins: [40, 40, 40, 80],
        content: [
            // HEADER (KEEP SAME)
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
                                margin: [0, 0, 0, 4],
                            },
                            {
                                text: `Invoice #${payment.transactionId || "TXN1756260994381563"}`,
                                fontSize: 10,
                                marginBottom: 4,
                                color: "#ffffff",
                                alignment: "right",
                            },
                            {
                                text: `Date: ${new Date(payment.paymentDate).toLocaleDateString(
                                    "en-US",
                                    { month: "numeric", day: "numeric", year: "numeric" }
                                )} ${new Date(payment.paymentDate).toLocaleTimeString("en-US", {
                                    hour: "numeric",
                                    minute: "2-digit",
                                    hour12: true,
                                })} AM New York`,
                                fontSize: 9,
                                color: "#ffffff",
                                alignment: "right",
                            },
                        ],
                    },
                ],
                margin: [0, 0, 0, 20],
            },

            // LINE (KEEP SAME)
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

            // ISSUED TO / BY (KEEP SAME)
            {
                columns: [
                    {
                        stack: [
                            { text: "ISSUED TO:", fontSize: 11, bold: true, color: "#C4A052", margin: [0, 0, 0, 5] },
                            { text: payment.name || "Customer Name", fontSize: 11, color: "#FFFFFF", bold: true, margin: [0, 0, 0, 4] },
                            { text: payment.email || "customer@email.com", fontSize: 9, color: "#ffffff", margin: [0, 0, 0, 4] },
                            ...billingAddressLines.map((line) => ({
                                text: line.trim(),
                                fontSize: 9,
                                color: "#ffffff",
                                margin: [0, 0, 0, 4],
                            })),
                        ],
                        width: "48%",
                    },
                    { text: "", width: "4%" },
                    {
                        stack: [
                            { text: "Issued By:", fontSize: 11, bold: true, color: "#C4A052", alignment: "right", margin: [0, 0, 0, 5] },
                            { text: "BounceCure", fontSize: 11, bold: true, color: "#FFFFFF", alignment: "right", margin: [0, 0, 0, 6] },

                            { text: "c/o Abacco Technologies LLC", fontSize: 9, color: "#FFFFFF", alignment: "right", margin: [0, 0, 0, 2] },
                            { text: "3524 Silverside Road, Suite 35B", fontSize: 9, color: "#FFFFFF", alignment: "right", margin: [0, 0, 0, 2] },
                            { text: "Wilmington, DE 19810-4929, USA", fontSize: 9, color: "#FFFFFF", alignment: "right", margin: [0, 0, 0, 8] },

                            { text: "Abacco Technology", fontSize: 9, bold: true, color: "#FFFFFF", alignment: "right", margin: [0, 0, 0, 2] },
                            { text: "3rd Floor, 12-4.13, 12A, J.B. Kaval", fontSize: 9, color: "#FFFFFF", alignment: "right", margin: [0, 0, 0, 2] },
                            { text: "Major Sandeep Unnikrishnan Road,", fontSize: 9, color: "#FFFFFF", alignment: "right", margin: [0, 0, 0, 2] },
                            { text: "Adityanagar, Vidyaranyapura, Bangalore 560097", fontSize: 9, color: "#FFFFFF", alignment: "right", margin: [0, 0, 0, 8] },

                            { text: "Website: www.bouncecure.com", fontSize: 9, color: "#FFFFFF", alignment: "right", margin: [0, 0, 0, 2] },
                            { text: "GST Number: 9922USA29012OSN", fontSize: 9, color: "#FFFFFF", alignment: "right" },
                        ],
                        width: "48%",
                    },
                ],
                margin: [0, 0, 0, 20],
            },

            // INVOICE DETAILS - FULL WIDTH
            { text: "Invoice Details", fontSize: 13, bold: true, color: "#C4A052", margin: [0, 0, 0, 10] },
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
                margin: [0, 0, 0, 0],
            },
            {
                table: {
                    widths: ["35%", "*"],
                    body: [
                        [
                            { text: "Plan Name", fontSize: 10, color: "#C4A052", margin: [12, 6, 10, 6], border: [false, false, false, false] },
                            { text: payment.planName || "Standard", fontSize: 10, color: "#FFFFFF", alignment: "right", margin: [10, 6, 12, 6], border: [false, false, false, false] },
                        ],
                        [
                            { text: "Contacts", fontSize: 10, color: "#C4A052", margin: [12, 6, 10, 6], border: [false, false, false, false] },
                            { text: String(payment.contacts || 0), fontSize: 10, color: "#FFFFFF", alignment: "right", margin: [10, 6, 12, 6], border: [false, false, false, false] },
                        ],
                        [
                            { text: "Discount", fontSize: 10, color: "#C4A052", margin: [12, 6, 10, 6], border: [false, false, false, false] },
                            {
                                text: discount > 0 ? `-${formatCurrency(discount, currencyCode)}` : "No discount",
                                fontSize: 10,
                                color: "#FFFFFF",
                                alignment: "right",
                                margin: [10, 6, 12, 6],
                                border: [false, false, false, false],
                            },
                        ],
                    ],
                },
                layout: {
                    fillColor: () => "#0a0a0a",
                    hLineColor: () => "#C4A052",
                    vLineColor: () => "#C4A052",
                    hLineWidth: (i, node) => 1,
                    vLineWidth: (i, node) => 1,
                },
                margin: [0, 0, 0, 15],
            },


            // PAYMENT SUMMARY - FULL WIDTH
            { text: "Payment Summary", fontSize: 13, bold: true, color: "#C4A052", margin: [0, 0, 0, 10] },
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
                margin: [0, 0, 0, 0],
            },
            {
                table: {
                    widths: ["35%", "*"],
                    body: [
                        [
                            { text: "Plan Price", fontSize: 10, color: "#C4A052", margin: [12, 6, 10, 6], border: [false, false, false, false] },
                            { text: formatCurrency(planPrice, currencyCode), fontSize: 10, color: "#FFFFFF", alignment: "right", margin: [10, 6, 12, 6], border: [false, false, false, false] },
                        ],
                        [
                            { text: "Discount", fontSize: 10, color: "#C4A052", margin: [12, 6, 10, 6], border: [false, false, false, false] },
                            {
                                text: discount > 0 ? `- ${formatCurrency(discount, currencyCode)}` : "No discount",
                                fontSize: 10,
                                color: "#FFFFFF",
                                alignment: "right",
                                margin: [10, 6, 12, 6],
                                border: [false, false, false, false],
                            },
                        ],
                        [
                            { text: "Subtotal", fontSize: 10, color: "#C4A052", margin: [12, 6, 10, 6], border: [false, false, false, false] },
                            { text: formatCurrency(subtotal, currencyCode), fontSize: 10, color: "#FFFFFF", alignment: "right", margin: [10, 6, 12, 6], border: [false, false, false, false] },
                        ],
                        [
                            { text: `Tax (10%)`, fontSize: 10, color: "#C4A052", margin: [12, 6, 10, 6], border: [false, false, false, false] },
                            { text: formatCurrency(tax, currencyCode), fontSize: 10, color: "#FFFFFF", alignment: "right", margin: [10, 6, 12, 6], border: [false, false, false, false] },
                        ],
                        [
                            { text: "Total", fontSize: 11, bold: true, color: "#C4A052", margin: [12, 8, 10, 8], border: [false, false, false, false] },
                            { text: formatCurrency(total, currencyCode), fontSize: 12, bold: true, color: "#FFFFFF", alignment: "right", margin: [10, 8, 12, 8], border: [false, false, false, false] },
                        ],
                    ],
                },
                layout: {
                    fillColor: () => "#0a0a0a",
                    hLineColor: () => "#C4A052",
                    vLineColor: () => "#C4A052",
                    hLineWidth: (i, node) => 1,
                    vLineWidth: (i, node) => 1,
                },
                margin: [0, 0, 0, 15],
            },
            // LINE (KEEP SAME)


            // PAYMENT INFORMATION - FULL WIDTH
            { text: "Payment Information", fontSize: 13, bold: true, color: "#C4A052", margin: [0, 0, 0, 10] },
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
                margin: [0, 0, 0, 0],
            },
            {
                table: {
                    widths: ["35%", "*"],
                    body: [
                        [
                            { text: "Payment Method", fontSize: 10, color: "#C4A052", margin: [12, 6, 10, 6], border: [false, false, false, false] },
                            {
                                text: `${payment.paymentMethod || "Visa"} ending in ${payment.cardLast4 || "4242"}}`,
                                fontSize: 10,
                                color: "#FFFFFF",
                                alignment: "right",
                                margin: [10, 6, 12, 6],
                                border: [false, false, false, false],
                            },
                        ],
                        [
                            { text: "Payment Date", fontSize: 10, color: "#C4A052", margin: [12, 6, 10, 6], border: [false, false, false, false] },
                            {
                                text: new Date(payment.paymentDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
                                fontSize: 10,
                                color: "#FFFFFF",
                                alignment: "right",
                                margin: [10, 6, 12, 6],
                                border: [false, false, false, false],
                            },
                        ],
                        [
                            { text: "Next Payment Date", fontSize: 10, color: "#C4A052", margin: [12, 6, 10, 6], border: [false, false, false, false] },
                            {
                                text: payment.nextPaymentDate
                                    ? new Date(payment.nextPaymentDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                                    : "N/A",
                                fontSize: 10,
                                color: "#FFFFFF",
                                alignment: "right",
                                margin: [10, 6, 12, 6],
                                border: [false, false, false, false],
                            },
                        ],
                    ],
                },
                layout: {
                    fillColor: () => "#0a0a0a",
                    hLineColor: () => "#C4A052",
                    vLineColor: () => "#C4A052",
                    hLineWidth: (i, node) => 1,
                    vLineWidth: (i, node) => 1,
                },
            },
        ],
        footer: {
            stack: [
                {
                    canvas: [
                        {
                            type: "line",
                            x1: 40,
                            y1: 0,
                            x2: 555,
                            y2: 0,
                            lineWidth: 1,
                            lineColor: "#C4A052",
                        },
                    ],
                    margin: [0, 0, 0, 5],
                },
                {
                    text: "Abacco Technology",
                    alignment: "center",
                    color: "#C4A052",
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