-- ============================================================
-- Run this entire script in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/njtfddsnsxlxlimuvhfa/sql
-- ============================================================

-- 1. Create the table
create table if not exists public.case_studies (
  id            bigint generated always as identity primary key,
  slug          text not null unique,
  company       text not null,
  industry      text not null,
  category      text not null,
  tagline       text not null,
  excerpt       text not null,
  hero_image    text not null,
  logo          text not null,
  read_time     text not null,
  published_date text not null,
  metrics       jsonb not null default '[]',
  challenge     text not null,
  solution      text not null,
  outcome       text not null,
  sections      jsonb not null default '[]',
  testimonial   jsonb not null default '{}',
  features_used text[] not null default '{}',
  use_case      text[] not null default '{}',
  display_order integer not null default 0,
  created_at    timestamptz not null default now()
);

-- 2. Enable RLS with public read access
alter table public.case_studies enable row level security;

drop policy if exists "Anyone can read case studies" on public.case_studies;
create policy "Anyone can read case studies"
  on public.case_studies
  for select
  using (true);

drop policy if exists "Authenticated admins can insert case studies" on public.case_studies;
create policy "Authenticated admins can insert case studies"
  on public.case_studies
  for insert
  to authenticated
  with check (true);

drop policy if exists "Authenticated admins can update case studies" on public.case_studies;
create policy "Authenticated admins can update case studies"
  on public.case_studies
  for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "Authenticated admins can delete case studies" on public.case_studies;
create policy "Authenticated admins can delete case studies"
  on public.case_studies
  for delete
  to authenticated
  using (true);

-- 3. Indexes
create index if not exists case_studies_slug_idx  on public.case_studies (slug);
create index if not exists case_studies_order_idx on public.case_studies (display_order);

-- 4. Seed data
insert into public.case_studies
  (slug, company, industry, category, tagline, excerpt, hero_image, logo,
   read_time, published_date, metrics, challenge, solution, outcome,
   sections, testimonial, features_used, use_case, display_order)
values
(
  'retail-brand-whatsapp-automation',
  'StyleMart India',
  'Retail & E-Commerce',
  'WhatsApp Marketing',
  'How StyleMart achieved 3× revenue growth with WhatsApp AI automation',
  'StyleMart India scaled their customer engagement using ConverseAI''s WhatsApp AI Chatbot, resulting in a 3× increase in repeat purchases and a 65% reduction in support costs.',
  'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&h=600&fit=crop',
  'https://images.unsplash.com/photo-1549924231-f129b911e442?w=80&h=80&fit=crop',
  '5 min read',
  'March 2025',
  '[
    {"label":"Revenue Growth","value":"3×","description":"Increase in repeat purchase revenue within 6 months"},
    {"label":"Support Cost Saved","value":"65%","description":"Reduction in customer support operational costs"},
    {"label":"Response Time","value":"< 30s","description":"Average first response time to customer queries"},
    {"label":"CSAT Score","value":"94%","description":"Customer satisfaction score across all channels"}
  ]'::jsonb,
  'StyleMart India, a fast-growing fashion retailer with 150+ stores, struggled to handle the surge of customer queries during seasonal sales. Their support team was overwhelmed, response times stretched to 6–8 hours, cart abandonment was at an all-time high of 72%, and re-engagement campaigns had near-zero open rates via email.',
  'ConverseAI deployed a full WhatsApp AI Chatbot integrated with StyleMart''s product catalog and order management system. Automated flows handled order tracking, product recommendations, abandoned cart recovery, and promotional broadcasts — all personalised based on past purchase behavior.',
  'Within six months of going live, StyleMart saw a 3× uplift in repeat purchase revenue driven by personalised WhatsApp re-engagement. Support costs dropped 65% as the AI resolved 80% of queries without human intervention. Abandoned cart recovery messages achieved a 38% conversion rate, far exceeding their previous email benchmarks.',
  '[
    {"title":"The Problem: Scale Without Compromise","content":"As StyleMart expanded across Tier 1 and Tier 2 cities, their customer base grew faster than their support infrastructure. During festive seasons like Diwali and End-of-Season sales, query volumes spiked by 400%, causing agents to burn out and customers to churn. Email open rates hovered at 12%, making re-engagement campaigns ineffective."},
    {"title":"Why ConverseAI?","content":"StyleMart evaluated three platforms before choosing ConverseAI. The decision came down to three factors: native WhatsApp Business API integration, AI that could be trained on their specific product catalog, and a live chat fallback that let human agents take over complex queries seamlessly."},
    {"title":"Implementation in 3 Weeks","content":"The ConverseAI team onboarded StyleMart in 21 days. Week 1 covered catalog sync and chatbot training. Week 2 was live testing with a cohort of 500 customers. Week 3 was a full rollout with live agent backup. The phased approach meant zero disruption to existing operations."},
    {"title":"Results That Moved the Needle","content":"Post-deployment analytics showed an immediate drop in first-response time from 6 hours to under 30 seconds. The AI handled 80% of all inbound queries autonomously. Personalised WhatsApp broadcasts achieved 61% open rates and 38% cart recovery — numbers the team had never seen before."}
  ]'::jsonb,
  '{"quote":"ConverseAI completely transformed how we talk to our customers. The WhatsApp chatbot feels like having 100 support agents available 24/7 at a fraction of the cost. Our customers love the instant responses.","author":"Priya Sharma","role":"Head of Digital, StyleMart India"}'::jsonb,
  array['WhatsApp AI Chatbot','WhatsApp Marketing','Live Chat','CSAT Report'],
  array['Abandoned cart recovery','Order tracking automation','Personalised broadcast campaigns','Product recommendations'],
  1
),
(
  'edtech-startup-chatbot-lead-generation',
  'LearnSphere',
  'EdTech',
  'AI Chatbot',
  'LearnSphere cut lead response time by 80% and doubled enrolments with AI chatbot',
  'LearnSphere, an online learning platform, deployed ConverseAI''s conversational chatbot to qualify and nurture leads round-the-clock, doubling course enrolments in 90 days.',
  'https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=1200&h=600&fit=crop',
  'https://images.unsplash.com/photo-1581093450021-4a7360e9a6b5?w=80&h=80&fit=crop',
  '4 min read',
  'February 2025',
  '[
    {"label":"Enrolment Growth","value":"2×","description":"Courses enrolled within 90 days of deployment"},
    {"label":"Lead Response Time","value":"−80%","description":"Faster lead qualification vs. manual process"},
    {"label":"Leads Qualified/Day","value":"500+","description":"Automated lead qualification without human agents"},
    {"label":"Cost Per Lead","value":"−45%","description":"Reduction in cost per qualified lead"}
  ]'::jsonb,
  'LearnSphere''s admissions team manually responded to every website inquiry — a process that took up to 48 hours. Prospective students who didn''t hear back quickly enrolled with competitors. The team needed a way to qualify leads instantly, personalise course recommendations, and follow up at scale without hiring more staff.',
  'ConverseAI''s Conversational AI Chatbot was embedded on LearnSphere''s website and integrated with their CRM. The bot asked qualification questions, recommended courses based on goals, shared brochures, and booked discovery calls — all automatically, 24/7. Complex queries were escalated to admissions counsellors via live chat with full conversation context.',
  'In 90 days, enrolments doubled. The chatbot qualified 500+ leads daily at a 45% lower cost per lead. Admissions counsellors spent their time only on hot, sales-ready conversations, increasing their close rates significantly.',
  '[
    {"title":"48-Hour Delays Were Killing Conversions","content":"In edtech, speed to lead is everything. A student exploring online courses often submits enquiries to five or more platforms simultaneously. LearnSphere''s 48-hour manual response window meant they consistently lost prospects to faster-moving competitors. The problem wasn''t lead volume — it was lead velocity."},
    {"title":"A Chatbot That Acts Like a Counsellor","content":"ConverseAI built a custom conversation flow that mimicked LearnSphere''s admissions process. The bot asked about learning goals, current skill level, preferred schedule, and budget. It then recommended the three most relevant courses, shared testimonials, and offered to book a call with a counsellor — all within two minutes of the first message."},
    {"title":"CRM Integration for Zero Drop-offs","content":"Every qualified lead was automatically pushed to LearnSphere''s CRM with full conversation history, qualification score, and recommended courses. Counsellors walked into calls already knowing exactly what the student needed, dramatically improving conversion rates."}
  ]'::jsonb,
  '{"quote":"We were sceptical about a bot replacing our counsellors, but ConverseAI proved us wrong. It doesn''t replace them — it makes them far more effective by only handing over the best leads. Our enrolment numbers speak for themselves.","author":"Aarav Mehta","role":"Co-founder & CEO, LearnSphere"}'::jsonb,
  array['Conversational AI Chatbot','Live Chat','Pre-Chat Forms','Agent Reports'],
  array['Instant lead qualification','Personalised course recommendations','Discovery call booking','CRM auto-sync'],
  2
),
(
  'healthcare-clinic-omnichannel-support',
  'CareFirst Clinics',
  'Healthcare',
  'Omni-Channel',
  'CareFirst Clinics reduced appointment no-shows by 55% with omnichannel automation',
  'CareFirst Clinics unified their patient communication across WhatsApp, web chat, and SMS using ConverseAI, slashing appointment no-shows and improving patient satisfaction scores.',
  'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200&h=600&fit=crop',
  'https://images.unsplash.com/photo-1585435557343-3b092031a831?w=80&h=80&fit=crop',
  '6 min read',
  'January 2025',
  '[
    {"label":"No-Show Reduction","value":"55%","description":"Fewer appointment no-shows after automated reminders"},
    {"label":"Patient Satisfaction","value":"+28pts","description":"NPS score improvement within 3 months"},
    {"label":"Admin Hours Saved","value":"120hrs","description":"Per month saved on manual appointment management"},
    {"label":"Appointment Fill Rate","value":"91%","description":"Calendar utilisation rate post-implementation"}
  ]'::jsonb,
  'CareFirst Clinics operated 12 branches across Rajasthan. Appointment no-shows ran at 40%, costing the clinic significant revenue and disrupting doctor schedules. Patient queries came through phone, WhatsApp, and the website simultaneously, and the front desk staff couldn''t keep up. There was no centralised system to track communications or follow up effectively.',
  'ConverseAI''s Omni-Channel platform brought together all patient touchpoints into a single inbox. Automated appointment reminders were sent via WhatsApp 24 hours and 2 hours before each appointment. Patients could confirm, reschedule, or cancel with a single reply. Pre-visit intake forms were collected digitally, saving doctor time during consultations.',
  'No-shows dropped 55% within the first month. The 120 hours per month previously spent on manual calls were reclaimed by the admin team. Patient NPS scores improved by 28 points as patients appreciated the proactive communication. Appointment slot utilisation climbed to 91%.',
  '[
    {"title":"The Hidden Cost of No-Shows","content":"A 40% no-show rate meant that on any given day, nearly half the booked consultation slots went unfilled. For CareFirst, this translated to lost revenue exceeding ₹15 lakh per month across branches. The root cause wasn''t patient disinterest — it was a lack of timely reminders and easy rescheduling options."},
    {"title":"One Inbox for All Channels","content":"Before ConverseAI, front-desk staff toggled between WhatsApp on personal phones, a website chat tool, and the telephone — with no shared history. ConverseAI''s Omni-Channel inbox gave every agent a unified view of every patient conversation, regardless of channel, with full history and context."},
    {"title":"Smart Automated Reminders","content":"The reminder workflow was configured to send a WhatsApp message 24 hours before each appointment with a one-tap confirmation link. A follow-up reminder went out 2 hours prior. If a patient didn''t confirm, an escalation flag triggered a personal call from the front desk — a significant upgrade from the previous blanket-call approach."},
    {"title":"Digital Intake Forms","content":"Pre-Chat Forms were repurposed as digital intake questionnaires sent to patients before their visit. Doctors received a structured patient summary before entering the consultation room, reducing average consultation time by 8 minutes and improving the quality of care."}
  ]'::jsonb,
  '{"quote":"The omnichannel inbox alone saved our front desk hours every single day. But the real win was the drop in no-shows — we recovered revenue we didn''t even know we were losing. Every clinic should be using this.","author":"Dr. Sunita Agarwal","role":"Operations Director, CareFirst Clinics"}'::jsonb,
  array['Omni-Channel','WhatsApp Marketing','Pre-Chat Forms','Team Reports','CSAT Report'],
  array['Automated appointment reminders','Multi-channel patient support','Digital intake forms','No-show prevention'],
  3
)
on conflict (slug) do nothing;




-- ============================================================
-- PRICING PLANS TABLE
-- ============================================================

create table if not exists public.pricing_plans (
  id bigint generated always as identity primary key,
  name text not null unique,
  monthly_price integer not null default 0,
  yearly_price integer not null default 0,
  description text not null,
  features text[] not null default '{}',
  popular boolean not null default false,
  display_order integer not null default 99,
  created_at timestamptz not null default now()
);

alter table public.pricing_plans enable row level security;

drop policy if exists "Public can read pricing plans" on public.pricing_plans;
create policy "Public can read pricing plans"
  on public.pricing_plans
  for select
  using (true);

drop policy if exists "Authenticated admins can insert pricing plans" on public.pricing_plans;
create policy "Authenticated admins can insert pricing plans"
  on public.pricing_plans
  for insert
  to authenticated
  with check (true);

drop policy if exists "Authenticated admins can update pricing plans" on public.pricing_plans;
create policy "Authenticated admins can update pricing plans"
  on public.pricing_plans
  for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "Authenticated admins can delete pricing plans" on public.pricing_plans;
create policy "Authenticated admins can delete pricing plans"
  on public.pricing_plans
  for delete
  to authenticated
  using (true);

create index if not exists pricing_plans_display_order_idx
  on public.pricing_plans(display_order);


insert into public.pricing_plans
  (name, monthly_price, yearly_price, description, features, popular, display_order)
values
  ('Basic', 0, 0, 'Perfect for freelancers and startups.', array['50 invoices/month','10 customers','100 transactions/month','Basic analytics','Email support'], false, 1),
  ('Professional', 500, 5000, 'Best for growing businesses.', array['2000 invoices/month','500 customers','Advanced analytics','Priority support','Team access'], true, 2),
  ('Enterprise', 2000, 20000, 'Unlimited access for large teams.', array['Unlimited invoices','Unlimited customers','API access','Dedicated support','Custom integrations'], false, 3)
on conflict (name) do update set
  monthly_price = excluded.monthly_price,
  yearly_price = excluded.yearly_price,
  description = excluded.description,
  features = excluded.features,
  popular = excluded.popular,
  display_order = excluded.display_order;