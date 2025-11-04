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

  if (code === "INR") return "₹" + Number(value).toFixed(2);

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

// 🧾 Invoice Generator
export const generateInvoice = async (payment) => {
  // ---------- PLAN-WISE CREDIT LOGIC ----------
// ---------- PLAN-WISE CREDIT LOGIC ----------
let credits = [];
const planName = (payment.planName || "").toLowerCase();
const planType = (payment.planType || "").toLowerCase();

if (planName === "essentials") {
  credits = [
    { label: "Send Email Credits", value: Number(payment.emailSendCredits || 50000) },
  ];
} else if (planName === "standard") {
  credits = [
    { label: "Email Validations", value: Number(payment.emailVerificationCredits || 50000) },
    { label: "Send Email Credits", value: Number(payment.emailSendCredits || 50000) },
  ];
} else if (planName === "premium") {
  credits = [
    { label: "Email Validations", value: Number(payment.emailVerificationCredits || 100000) },
    { label: "Send Email Credits", value: Number(payment.emailSendCredits || 100000) },
  ];
}

// ✅ Email Verification Plans
else if (planType === "email-verification") {
  credits = [
    { label: "Email Validations", value: Number(payment.emailVerificationCredits || payment.verificationCredits || 0) },
  ];
}

// ✅ SMS Campaign Plans
else if (planType === "multimedia-sms") {
  credits = [
    { label: "SMS Campaign Credits", value: Number(payment.smsCredits || payment.smsVolume || 0) },
  ];
}

// ✅ WhatsApp Plans (future)
else if (planType === "multimedia-whatsapp") {
  credits = [
    { label: "WhatsApp Campaign Credits", value: Number(payment.whatsappCredits || 0) },
  ];
}


  // ---------- PAYMENT CALCULATION ----------
  const paymentAmount = Number(((payment.amount / 11) * 10) + (payment.discount || 0)).toFixed(2);
  const planPrice = Number(paymentAmount);
  const discount = Number(payment.discount || 0);
  const taxRate = 0.1;
  const subtotal = Number((planPrice - discount).toFixed(2));
  const tax = Number((subtotal * taxRate).toFixed(2));
  const total = Number((subtotal + tax).toFixed(2));
  const currencyCode = (payment.currency || "USD").toUpperCase();

  const billingAddressLines = payment.billingAddress
    ? payment.billingAddress.split(",")
    : [];

  // ---------- PDF CONTENT ----------
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
      // HEADER SECTION
      {
        columns: [
         {
          stack: [
            {
              canvas: [
                {
                  type: "ellipse",
                  x: 40,
                  y: 40,
                  r1: 40,
                  r2: 40,
                  color: "#0a0a0a",     // keep dark theme
                  lineWidth: 2,
                  lineColor: "#C4A052", // gold border
                },
              ],
              width: 80,
              height: 80,
            },
            {
              image: "templates/logo.png",
              width: 50,
              absolutePosition: { x: 55, y: 55 }  // Center logo properly
            },
          ],
          width: 120,
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
                text: `Invoice #${payment.customInvoiceId || payment.transactionId || "BC234Ab5000"}`,
                fontSize: 10,
                color: "#ffffff",
                alignment: "right",
                margin: [0, 0, 0, 4],
              },
              {
                text: `Date: ${new Date(payment.paymentDate).toLocaleDateString("en-US", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                }).replace(/ /g, "-").toUpperCase()}`,
                fontSize: 9,
                color: "#ffffff",
                alignment: "right",
                margin: [0, 4, 0, 8],
              },

            ],
          },

        ],
        margin: [0, 0, 0, 20],
      },

      // LINE SEPARATOR
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

      // ISSUED TO + COMPANY DETAILS SIDE BY SIDE
      {
        columns: [
          {
            width: "50%",
            stack: [
              { text: "ISSUED TO:", fontSize: 11, bold: true, color: "#C4A052", margin: [0, 0, 0, 5] },
              { text: payment.name || "Customer Name", fontSize: 11, color: "#FFFFFF", bold: true },
              { text: payment.email || "customer@email.com", fontSize: 9, color: "#ffffff", margin: [0, 2, 0, 4] },
              ...billingAddressLines.map(line => ({
                text: line.trim(),
                fontSize: 9,
                color: "#ffffff",
              })),
            ],
            margin: [0, 0, 0, 20],
          },
          {
            width: "50%",
            alignment: "right",
            stack: [
              { text: "BounceCure", fontSize: 11, bold: true, color: "#FFFFFF" },
              { text: "c/o Abacco Technologies LLC", fontSize: 9, color: "#FFFFFF" },
              { text: "3524 Silverside Road, Suite 35B", fontSize: 9, color: "#FFFFFF" },
              { text: "Wilmington, DE 19810-4929, USA", fontSize: 9, color: "#FFFFFF" },
              { text: " ", margin: [0, 4] },
              { text: "Website: www.bouncecure.com", fontSize: 9, color: "#FFFFFF" },
              { text: "GST Number: 29AZTPG2418G1Z5", fontSize: 9, color: "#FFFFFF" },
            ],
            margin: [0, 0, 0, 20],
          },
        ],
        columnGap: 20, // equal spacing between left & right sections
        margin: [0, 0, 0, 20],
      },
      // INVOICE DETAILS TABLE
      { text: "Invoice Details", fontSize: 13, bold: true, color: "#C4A052", margin: [0, 0, 0, 10] },
      {
        table: {
          widths: ["55%", "*"],
          body: [
            [
              { text: "Plan Name", color: "#C4A052", fontSize: 10, margin: [12, 6], border: [false, false, false, false] },
              { text: payment.planName || "Standard", color: "#FFFFFF", fontSize: 10, alignment: "right", margin: [10, 6], border: [false, false, false, false] },
            ],
            ...credits.map(c => [
              { text: c.label, color: "#C4A052", fontSize: 10, margin: [12, 6], border: [false, false, false, false] },
              { text: c.value.toLocaleString(), color: "#FFFFFF", fontSize: 10, alignment: "right", margin: [10, 6], border: [false, false, false, false] },
            ]),
            [
              { text: "Discount", color: "#C4A052", fontSize: 10, margin: [12, 6], border: [false, false, false, false] },
              { text: discount > 0 ? `-${formatCurrency(discount, currencyCode)}` : "No discount", color: "#FFFFFF", fontSize: 10, alignment: "right", border: [false, false, false, false] },
            ],
          ],
        },
        layout: "noBorders",
        margin: [0, 0, 0, 15],
      },

      // PAYMENT SUMMARY
      { text: "Payment Summary", fontSize: 13, bold: true, color: "#C4A052", margin: [0, 0, 0, 10] },
      {
        table: {
          widths: ["35%", "*"],
          body: [
            ["Plan Price", formatCurrency(planPrice, currencyCode)],
            ["Discount", discount > 0 ? `- ${formatCurrency(discount, currencyCode)}` : "No discount"],
            ["Subtotal", formatCurrency(subtotal, currencyCode)],
            ["Tax (10%)", formatCurrency(tax, currencyCode)],
            ["Total", formatCurrency(total, currencyCode)],
          ].map(([label, val]) => [
            { text: label, fontSize: 10, color: "#C4A052", margin: [12, 6], border: [false, false, false, false] },
            { text: val, fontSize: 10, color: "#FFFFFF", alignment: "right", margin: [10, 6], border: [false, false, false, false] },
          ]),
        },
        layout: "noBorders",
        margin: [0, 0, 0, 15],
      },

      // PAYMENT INFORMATION
      { text: "Payment Information", fontSize: 13, bold: true, color: "#C4A052", margin: [0, 0, 0, 10] },
      {
        table: {
          widths: ["35%", "*"],
          body: [
            ["Payment Method", `${payment.paymentMethod || "Visa"} ending in ${payment.cardLast4 || "****"}`],
            ["Payment Date", new Date(payment.paymentDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })],
            ["Next Payment Date", payment.nextPaymentDate ? new Date(payment.nextPaymentDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "N/A"],
          ].map(([label, val]) => [
            { text: label, fontSize: 10, color: "#C4A052", margin: [12, 6], border: [false, false, false, false] },
            { text: val, fontSize: 10, color: "#FFFFFF", alignment: "right", margin: [10, 6], border: [false, false, false, false] },
          ]),
        },
        layout: "noBorders",
      },
    ],

    footer: {
      stack: [
        {
          canvas: [
            { type: "line", x1: 40, y1: 0, x2: 555, y2: 0, lineWidth: 1, lineColor: "#C4A052" },
          ],
          margin: [0, 0, 0, 5],
        },
        {
          columns: [
            {
              stack: [
                { text: "Abacco Technology", fontSize: 9, bold: true, color: "#FFFFFF" },
                { text: "3rd Floor, 12-4.13, 12A, J.B. Kaval", fontSize: 8, color: "#FFFFFF" },
                { text: "Major Sandeep Unnikrishnan Road,", fontSize: 8, color: "#FFFFFF" },
                { text: "Adityanagar, Vidyaranyapura", fontSize: 8, color: "#FFFFFF" },
                { text: "Bangalore 560097", fontSize: 8, color: "#FFFFFF" },
              ],
              width: "50%",
              margin: [40, 10, 0, 0],
            },
            {
              stack: [
                { text: "Abacco Technology", fontSize: 10, bold: true, color: "#C4A052", alignment: "right" },
                { text: `All Rights Reserved © ${new Date().getFullYear()}`, fontSize: 8, color: "#FFFFFF", alignment: "right", margin: [0, 2, 0, 0] },
              ],

              width: "50%",
              margin: [0, 10, 40, 0],
            },
          ],
        },
      ],
    },

    defaultStyle: { font: "Helvetica" },
  };

  // ---------- PDF GENERATION ----------
  const pdfDoc = printer.createPdfKitDocument(docDefinition);
  const chunks = [];

  return new Promise((resolve, reject) => {
    pdfDoc.on("data", (chunk) => chunks.push(chunk));
    pdfDoc.on("end", () => resolve(Buffer.concat(chunks)));
    pdfDoc.on("error", (err) => reject(err));
    pdfDoc.end();
  });
};
