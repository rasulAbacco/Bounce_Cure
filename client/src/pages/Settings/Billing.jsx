import React, { useState, useRef, useEffect } from "react";
import { TOKENS } from "../utils/tokens";
import { cls } from "../utils/cls";

import LabeledInput from "../LabeledInput";
import LabeledSelect from "../LabeledSelect";
import Modal from "../Modal";

import FaLock from "../icons/FaLock";
import FaPlus from "../icons/FaPlus";
import FaDownload from "../icons/FaDownload";
import FaEdit from "../icons/FaEdit";
import FaTrash from "../icons/FaTrash";

export default function Billing() {
  const [card, setCard] = useState({
    brand: "Visa",
    last4: "4242",
    exp: "08/27",
    name: "Ada Lovelace",
    type: "Credit",
  });
  const [showCardModal, setShowCardModal] = useState(false);
  const [newCard, setNewCard] = useState({
    name: "",
    number: "",
    exp: "",
    cvc: "",
    type: "Credit",
  });
  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [enteredOtp, setEnteredOtp] = useState(["", "", "", "", "", ""]);
  const [otpSent, setOtpSent] = useState(false);

  const [history, setHistory] = useState([
    { id: "INV-1007", date: "2025-08-01", description: "Pro Plan – Monthly", amount: 19.0, status: "Paid" },
    { id: "INV-1006", date: "2025-07-01", description: "Pro Plan – Monthly", amount: 19.0, status: "Paid" },
    { id: "INV-1005", date: "2025-06-01", description: "Pro Plan – Monthly", amount: 19.0, status: "Paid" },
  ]);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [editingRow, setEditingRow] = useState(null);
  const [draftRow, setDraftRow] = useState({
    id: "",
    date: "",
    description: "",
    amount: "",
    status: "Pending",
  });

  const detectCardBrand = (number) => {
    if (!number) return "Card";
    if (/^4/.test(number)) return "Visa";
    if (/^5[1-5]/.test(number)) return "Mastercard";
    if (/^3[47]/.test(number)) return "Amex";
    if (/^6/.test(number)) return "Discover";
    return "Card";
  };

  const sendOtp = () => {
    if (!newCard.name || !newCard.number || !newCard.exp || !newCard.cvc) {
      alert("Please fill in all fields");
      return;
    }
    setOtpSent(true);
    setShowCardModal(false);
    setOtpModalOpen(true);
    setEnteredOtp(["", "", "", "", "", ""]);
  };

  const handleCardSave = () => {
    setCard({
      brand: detectCardBrand(newCard.number),
      last4: newCard.number.replace(/\s/g, "").slice(-4),
      exp: newCard.exp,
      name: newCard.name,
      type: newCard.type,
    });
    setNewCard({ name: "", number: "", exp: "", cvc: "", type: "Credit" });
    setOtpSent(false);
  };

  const otpValue = enteredOtp.join("");
  const onOtpChange = (idx, val) => {
    if (!/^[0-9]?$/.test(val)) return;
    const copy = [...enteredOtp];
    copy[idx] = val;
    setEnteredOtp(copy);
  };

  const otpInputsRef = useRef([]);
  useEffect(() => {
    const i = enteredOtp.findIndex((d) => d === "");
    if (i > -1 && otpInputsRef.current[i]) otpInputsRef.current[i].focus();
  }, [otpValue]);

  const verifyOtpAndSave = () => {
    if (otpValue.length !== 6) {
      alert("Please enter the 6-digit OTP");
      return;
    }
    if (otpValue === "123456") {
      handleCardSave();
      setOtpModalOpen(false);
      setEnteredOtp(["", "", "", "", "", ""]);
      alert("Card updated successfully!");
    } else {
      alert("Invalid OTP. Please try again.");
    }
  };

  const openAddHistory = () => {
    setEditingRow(null);
    setDraftRow({
      id: "",
      date: new Date().toISOString().slice(0, 10),
      description: "",
      amount: "",
      status: "Pending",
    });
    setShowHistoryModal(true);
  };

  const openEditHistory = (row) => {
    setEditingRow(row.id);
    setDraftRow({ ...row, amount: String(row.amount) });
    setShowHistoryModal(true);
  };

  const saveHistoryRow = () => {
    const amt = parseFloat(draftRow.amount);
    if (!draftRow.id || !draftRow.date || !draftRow.description || isNaN(amt)) {
      alert("Please complete all fields with a valid amount");
      return;
    }
    const row = { id: draftRow.id, date: draftRow.date, description: draftRow.description, amount: amt, status: draftRow.status };
    setHistory((prev) => {
      const exists = prev.some((r) => r.id === row.id);
      if (exists) return prev.map((r) => (r.id === row.id ? row : r));
      return [row, ...prev];
    });
    setShowHistoryModal(false);
  };

  const deleteHistoryRow = (id) => {
    if (window.confirm("Delete this entry?")) setHistory((prev) => prev.filter((r) => r.id !== id));
  };

  const downloadCSV = () => {
    const header = ["Invoice ID", "Date", "Description", "Amount", "Status"].join(",");
    const lines = history
      .map((h) => [h.id, h.date, `"${h.description.replaceAll('"', '""')}"`, h.amount.toFixed(2), h.status].join(","))
      .join("\n");
    const csv = header + "\n" + lines;
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `billing-history-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadReceipt = (row) => {
    const text = `Receipt\nInvoice: ${row.id}\nDate: ${row.date}\nDescription: ${row.description}\nAmount: $${row.amount.toFixed(2)}\nStatus: ${row.status}\nPaid with: ${card.type} ${card.brand} •••• ${card.last4}`;
    const blob = new Blob([text], { type: "text/plain;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${row.id}-receipt.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={cls(TOKENS.card, "space-y-6")} id="panel-billing" role="tabpanel">
      <h2 className="text-2xl font-bold text-amber-400">Billing</h2>

      {/* Current Card */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center p-4 border border-amber-500/50 rounded-xl bg-white/5">
        <div>
          <p className="text-white font-medium">{card.type} {card.brand} •••• {card.last4}</p>
          <p className="text-white/70 text-sm">{card.name} — Expires {card.exp}</p>
        </div>
        <div className="flex gap-3">
          <button className={TOKENS.btnPrimary} onClick={() => setShowCardModal(true)}>
            Update Card
          </button>
        </div>
      </div>

      {/* Card Update Modal */}
      <Modal
        open={showCardModal}
        title="Update Payment Card"
        onClose={() => setShowCardModal(false)}
        footer={
          <>
            <button className={TOKENS.btnSecondary} onClick={() => setShowCardModal(false)}>Cancel</button>
            <button className={TOKENS.btnPrimary} onClick={sendOtp}>Save Card</button>
          </>
        }
      >
        <div className="grid grid-cols-1 gap-4">
          <LabeledSelect
            label="Card Type"
            value={newCard.type}
            onChange={(e) => setNewCard((c) => ({ ...c, type: e.target.value }))}
          >
            <option value="Credit">Credit Card</option>
            <option value="Debit">Debit Card</option>
          </LabeledSelect>
          <LabeledInput
            label="Name on Card"
            value={newCard.name}
            onChange={(e) => setNewCard(c => ({ ...c, name: e.target.value }))}
            placeholder="Enter cardholder name"
          />
          <LabeledInput
            label="Card Number"
            inputMode="numeric"
            maxLength={19}
            placeholder="4242 4242 4242 4242"
            value={newCard.number}
            onChange={e => {
              const digits = e.target.value.replace(/\D/g, "").slice(0, 16);
              const spaced = digits.replace(/(.{4})/g, "$1 ").trim();
              setNewCard(c => ({ ...c, number: spaced }));
            }}
          />
          <div className="grid grid-cols-2 gap-4">
            <LabeledInput
              label="Expiry"
              placeholder="MM/YY"
              maxLength={5}
              value={newCard.exp}
              onChange={e => {
                let value = e.target.value.replace(/\D/g, "");
                if (value.length >= 2) {
                  value = value.slice(0, 2) + "/" + value.slice(2, 4);
                }
                setNewCard(c => ({ ...c, exp: value }));
              }}
            />
            <LabeledInput
              label="CVC"
              placeholder="123"
              inputMode="numeric"
              maxLength={4}
              value={newCard.cvc}
              onChange={e => setNewCard(c => ({ ...c, cvc: e.target.value.replace(/\D/g, "") }))}
            />
          </div>
        </div>
      </Modal>

      {/* OTP Modal */}
      <Modal
        open={otpModalOpen}
        title="Verify Your Identity"
        onClose={() => {
          setOtpModalOpen(false);
          setEnteredOtp(["", "", "", "", "", ""]);
          setOtpSent(false);
        }}
        footer={
          <>
            <button
              className={TOKENS.btnSecondary}
              onClick={() => {
                setOtpModalOpen(false);
                setEnteredOtp(["", "", "", "", "", ""]);
                setOtpSent(false);
              }}
            >
              Cancel
            </button>
            <button
              className={TOKENS.btnPrimary}
              onClick={verifyOtpAndSave}
              disabled={otpValue.length !== 6}
            >
              Verify & Save
            </button>
          </>
        }
      >
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-amber-400/20 rounded-full flex items-center justify-center">
            <FaLock className="w-8 h-8 text-amber-400" />
          </div>
          <div>
            <p className="text-white font-medium mb-2">Enter Verification Code</p>
            <p className="text-white/70 text-sm">
              We've sent a 6-digit verification code to your registered mobile number ending in ***67.
            </p>
          </div>
          <div className="flex gap-3 justify-center">
            {enteredOtp.map((v, i) => (
              <input
                key={i}
                ref={(el) => (otpInputsRef.current[i] = el)}
                value={v}
                onChange={(e) => onOtpChange(i, e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Backspace" && !enteredOtp[i] && i > 0) {
                    otpInputsRef.current[i - 1]?.focus();
                  }
                  if (/^[0-9]$/.test(e.key) && i < 5) {
                    setTimeout(() => otpInputsRef.current[i + 1]?.focus(), 50);
                  }
                }}
                inputMode="numeric"
                maxLength={1}
                className="w-12 h-12 text-center text-xl font-bold rounded-xl bg-white/10 border-2 border-white/20 focus:border-amber-400 focus:outline-none text-white transition-colors"
              />
            ))}
          </div>
        </div>
      </Modal>

      {/* Billing History */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Payment History</h3>
          <div className="flex gap-2">
            <button className={cls(TOKENS.btnSecondary, "flex items-center gap-2")} onClick={openAddHistory}>
              <FaPlus /> Add Entry
            </button>
            <button className={cls(TOKENS.btnPrimary, "flex items-center gap-2")} onClick={downloadCSV}>
              <FaDownload /> Export CSV
            </button>
          </div>
        </div>

        <div className="overflow-x-auto border border-white/10 rounded-xl">
          <table className="min-w-full text-sm">
            <thead className="bg-white/5">
              <tr>
                <th className="text-left p-3 text-white/90">Invoice</th>
                <th className="text-left p-3 text-white/90">Date</th>
                <th className="text-left p-3 text-white/90">Description</th>
                <th className="text-right p-3 text-white/90">Amount</th>
                <th className="text-left p-3 text-white/90">Status</th>
                <th className="text-right p-3 text-white/90">Actions</th>
              </tr>
            </thead>
            <tbody>
              {history.map((row) => (
                <tr key={row.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="p-3 font-mono text-white">{row.id}</td>
                  <td className="p-3 text-white/80">{row.date}</td>
                  <td className="p-3 text-white/80">{row.description}</td>
                  <td className="p-3 text-right font-medium text-white">${row.amount.toFixed(2)}</td>
                  <td className="p-3">
                    <span className={cls(
                      "px-2 py-1 rounded-full text-xs font-medium",
                      row.status === "Paid" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" :
                      row.status === "Pending" ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" :
                      "bg-red-500/20 text-red-400 border border-red-500/30"
                    )}>
                      {row.status}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button title="Download receipt" className={TOKENS.iconBtn} onClick={() => downloadReceipt(row)}>
                        <FaDownload />
                      </button>
                      <button title="Edit" className={TOKENS.iconBtn} onClick={() => openEditHistory(row)}>
                        <FaEdit />
                      </button>
                      <button title="Delete" className={TOKENS.iconBtn} onClick={() => deleteHistoryRow(row.id)}>
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit History Modal */}
      <Modal
        open={showHistoryModal}
        title={editingRow ? `Edit Entry – ${editingRow}` : "Add New Entry"}
        onClose={() => setShowHistoryModal(false)}
        footer={
          <>
            <button className={TOKENS.btnSecondary} onClick={() => setShowHistoryModal(false)}>Cancel</button>
            <button className={TOKENS.btnPrimary} onClick={saveHistoryRow}>
              {editingRow ? "Update Entry" : "Add Entry"}
            </button>
          </>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <LabeledInput
            label="Invoice ID"
            placeholder="INV-1008"
            value={draftRow.id}
            onChange={(e) => setDraftRow((d) => ({ ...d, id: e.target.value }))}
          />
          <LabeledInput
            type="date"
            label="Date"
            value={draftRow.date}
            onChange={(e) => setDraftRow((d) => ({ ...d, date: e.target.value }))}
          />
          <LabeledInput
            className="sm:col-span-2"
            label="Description"
            placeholder="Pro Plan - Monthly subscription"
            value={draftRow.description}
            onChange={(e) => setDraftRow((d) => ({ ...d, description: e.target.value }))}
          />
          <LabeledInput
            label="Amount (USD)"
            placeholder="19.00"
            inputMode="decimal"
            value={draftRow.amount}
            onChange={(e) => setDraftRow((d) => ({ ...d, amount: e.target.value }))}
          />
          <LabeledSelect
            label="Status"
            value={draftRow.status}
            onChange={(e) => setDraftRow((d) => ({ ...d, status: e.target.value }))}
          >
            <option value="Paid">Paid</option>
            <option value="Pending">Pending</option>
            <option value="Failed">Failed</option>
          </LabeledSelect>
        </div>
      </Modal>
    </div>
  );
}
