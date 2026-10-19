import { useState } from 'react';
import { formatINR } from '../../lib/formatters';
import { IconCopy, IconCheck, IconWhatsApp } from '../../lib/icons';
import { Button, Input, Modal } from '../ui';

interface BillingCalculatorModalProps {
  onClose: () => void;
  initialClientName?: string;
  initialProjectTitle?: string;
  initialBaseFee?: number;
  initialAdvancePaid?: number;
}

export function BillingCalculatorModal({
  onClose,
  initialClientName = '',
  initialProjectTitle = '',
  initialBaseFee = 45000,
  initialAdvancePaid = 22500
}: BillingCalculatorModalProps) {
  const [clientName, setClientName] = useState(initialClientName);
  const [projectTitle, setProjectTitle] = useState(initialProjectTitle);
  const [baseFee, setBaseFee] = useState(initialBaseFee);
  const [includeGst, setIncludeGst] = useState(true);
  const [advancePaid, setAdvancePaid] = useState(initialAdvancePaid);
  const [upiId, setUpiId] = useState('cyberslayercorpz@upi');
  const [copied, setCopied] = useState(false);

  const gstRate = 0.18;
  const gstAmount = includeGst ? Math.round(baseFee * gstRate) : 0;
  const totalInvoice = baseFee + gstAmount;
  const balanceDue = Math.max(0, totalInvoice - advancePaid);

  const invoiceSummary = `=========================================
OFFICIAL INVOICE SUMMARY — CYBERSLAYERCORPZ (CSC)
=========================================
Client: ${clientName.trim() || 'Valued Client'}
Project: ${projectTitle.trim() || 'Digital Platform Deliverables'}
Date: ${new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}

Base Development Fee: ${formatINR(baseFee)}
${includeGst ? `GST (18%): ${formatINR(gstAmount)}\n` : ''}Total Invoice Value: ${formatINR(totalInvoice)}
Advance Received: ${formatINR(advancePaid)}
-----------------------------------------
OUTSTANDING BALANCE DUE: ${formatINR(balanceDue)}
-----------------------------------------

PAYMENT MODES:
1. Instant UPI: ${upiId} (Google Pay / PhonePe / Paytm)
2. Bank Transfer / NEFT / IMPS
Bank: HDFC Bank
A/C Name: CyberSlayerCorpz
IFSC: HDFC0001234

Thank you for choosing CyberSlayerCorpz!
=========================================`;

  const handleCopy = () => {
    navigator.clipboard.writeText(invoiceSummary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendWhatsApp = () => {
    const encoded = encodeURIComponent(invoiceSummary);
    window.open(`https://wa.me/?text=${encoded}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="UPI & GST Milestone Invoice Builder"
      description="Automated 18% GST computation and payment dispatch."
    >
      <div className="space-y-3.5 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Client Name"
            type="text"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            placeholder="e.g. Client Company Name"
          />
          <Input
            label="Project Scope"
            type="text"
            value={projectTitle}
            onChange={(e) => setProjectTitle(e.target.value)}
            placeholder="e.g. Website Platform & Lookbook"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Base Fee (INR ₹)"
            type="number"
            min="0"
            value={baseFee}
            onChange={(e) => setBaseFee(Number(e.target.value))}
          />
          <Input
            label="Advance Received (INR ₹)"
            type="number"
            min="0"
            value={advancePaid}
            onChange={(e) => setAdvancePaid(Number(e.target.value))}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
          <label className="flex items-center gap-2.5 cursor-pointer p-2.5 bg-black border border-[#222222] rounded-md text-xs text-[#ededed]">
            <input
              type="checkbox"
              checked={includeGst}
              onChange={(e) => setIncludeGst(e.target.checked)}
              className="w-4 h-4 rounded bg-black border-[#222222] text-emerald-500 focus:ring-0 focus:ring-offset-0"
            />
            <span className="font-medium">Add 18% GST (CGST+SGST)</span>
          </label>

          <Input
            label="UPI ID for Payment"
            type="text"
            value={upiId}
            onChange={(e) => setUpiId(e.target.value)}
            placeholder="cyberslayercorpz@upi"
          />
        </div>

        {/* Invoice Calculation Summary Box */}
        <div className="bg-black border border-[#222222] rounded-md p-4 space-y-2 font-mono text-xs">
          <div className="flex justify-between text-[#888888] font-sans">
            <span>Subtotal Fee:</span>
            <span className="text-white font-medium font-mono">{formatINR(baseFee)}</span>
          </div>
          {includeGst && (
            <div className="flex justify-between text-[#666666] text-[11px] font-sans">
              <span>GST @ 18%:</span>
              <span className="text-[#a1a1a1] font-mono">+{formatINR(gstAmount)}</span>
            </div>
          )}
          <div className="flex justify-between text-white font-semibold text-xs pt-1.5 border-t border-[#1c1c1c] font-sans">
            <span>Total Invoice:</span>
            <span className="font-mono">{formatINR(totalInvoice)}</span>
          </div>
          <div className="flex justify-between text-emerald-400 text-xs font-sans">
            <span>Advance Collected:</span>
            <span className="font-mono">-{formatINR(advancePaid)}</span>
          </div>
          <div className="flex justify-between text-amber-400 font-bold text-sm pt-1.5 border-t border-[#1c1c1c] font-display">
            <span>Balance Due:</span>
            <span className="font-mono">{formatINR(balanceDue)}</span>
          </div>
        </div>

        <div className="flex flex-wrap justify-end gap-2 pt-2 border-t border-[#222222]">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onClose}
          >
            Close
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCopy}
            leftIcon={copied ? <IconCheck className="w-3.5 h-3.5 text-emerald-400" /> : <IconCopy className="w-3.5 h-3.5" />}
          >
            {copied ? 'Copied' : 'Copy Invoice Text'}
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleSendWhatsApp}
            className="bg-emerald-500 hover:bg-emerald-400 text-black font-semibold border-transparent"
            leftIcon={<IconWhatsApp className="w-4 h-4" />}
          >
            Send on WhatsApp
          </Button>
        </div>
      </div>
    </Modal>
  );
}
