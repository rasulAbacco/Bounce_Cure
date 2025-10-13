// New folder/leadService.js
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

/**
 * Create or update a lead from parsed email data.
 * parsed = { name, email, phone, company, keywords: [] }
 */
export async function upsertLeadFromEmail(userId, parsed) {
    if (!parsed || !parsed.email) return null;

    // try find existing lead or contact by email
    const existingLead = await prisma.lead.findFirst({
        where: { email: parsed.email, ownerId: userId }
    });
    if (existingLead) {
        // enrich fields
        const updates = {};
        if (parsed.name) {
            const parts = parsed.name.split(' ');
            if (!existingLead.firstName) updates.firstName = parts[0];
            if (!existingLead.lastName && parts.length > 1) updates.lastName = parts.slice(1).join(' ');
        }
        if (parsed.phone && !existingLead.phone) updates.phone = parsed.phone;
        if (parsed.company && !existingLead.company) updates.company = parsed.company;
        if (Object.keys(updates).length) {
            await prisma.lead.update({ where: { id: existingLead.id }, data: updates });
        }
        return existingLead;
    }

    // create new lead
    const leadData = {
        email: parsed.email,
        source: 'email',
        createdAt: new Date(),
        ownerId: userId,
        score: 0,
        customFields: parsed.custom || {}
    };
    if (parsed.name) {
        const parts = parsed.name.split(' ');
        leadData.firstName = parts[0];
        if (parts.length > 1) leadData.lastName = parts.slice(1).join(' ');
    }
    if (parsed.phone) leadData.phone = parsed.phone;
    if (parsed.company) leadData.company = parsed.company;

    const newLead = await prisma.lead.create({ data: leadData });
    return newLead;
}

export async function recalcLeadScore(leadId) {
    const lead = await prisma.lead.findUnique({ where: { id: leadId } });
    if (!lead) return null;
    let score = 0;
    const reasons = [];

    // Example rules:
    // +30 if company exists
    if (lead.company) { score += 30; reasons.push({ rule: 'company_present', points: 30 }); }
    // +20 if email is corporate (not gmail/yahoo)
    if (lead.email && !/@(gmail|yahoo|hotmail|outlook)\./i.test(lead.email)) { score += 20; reasons.push({ rule: 'corporate_email', points: 20 }); }
    // +10 if there are any keywords signalling interest in parsed emails (you would populate reasons via parsing)
    // Fetch recent email parsing metadata
    const emails = await prisma.email.findMany({ where: { leadId: leadId }, orderBy: { receivedAt: 'desc' }, take: 10 });
    let keywordHit = false;
    for (const e of emails) {
        const meta = e.parsingMeta || {};
        const keywords = meta.keywords || [];
        if (keywords.length) { keywordHit = true; break; }
    }
    if (keywordHit) { score += 10; reasons.push({ rule: 'keywords_in_email', points: 10 }); }

    // update store
    await prisma.lead.update({ where: { id: leadId }, data: { score } });
    const up = await prisma.leadScore.upsert({
        where: { leadId },
        create: { leadId, score, reasons },
        update: { score, reasons }
    });
    return { score, reasons };
}

