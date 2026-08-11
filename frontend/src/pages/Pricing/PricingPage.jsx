import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Badge } from '@/components/ui';

const plans = [
  {
    name: 'Free',
    price: { monthly: 0, yearly: 0 },
    description: 'Perfect for getting started with interview prep',
    features: [
      '1 Resume ATS Analysis',
      '10 Aptitude Questions/day',
      '3 Coding Problems/day',
      'Basic Technical Interview',
      'Community Support',
      'Basic Analytics',
    ],
    notIncluded: [
      'Voice Interview Mode',
      'Company-Specific Mode',
      'Advanced Analytics',
      'PDF Report Export',
      'Priority Support',
    ],
    cta: 'Get Started Free',
    popular: false,
    color: 'from-slate-600 to-slate-800',
  },
  {
    name: 'Pro',
    price: { monthly: 29, yearly: 290 },
    description: 'Best for serious job seekers and professionals',
    features: [
      'Unlimited Resume Analyses',
      'Unlimited Aptitude Tests',
      'Unlimited Coding Problems',
      'All Interview Modules',
      'Voice Interview Mode',
      'Company-Specific Mode (6 companies)',
      'Advanced Analytics & Insights',
      'PDF Report Export',
      'AI Learning Path',
      'Priority Email Support',
    ],
    notIncluded: [
      'Custom Company Templates',
      'Dedicated Account Manager',
    ],
    cta: 'Start Pro Trial',
    popular: true,
    color: 'from-blue-600 to-purple-600',
  },
  {
    name: 'Enterprise',
    price: { monthly: 99, yearly: 990 },
    description: 'For teams, recruiters, and organizations',
    features: [
      'Everything in Pro',
      'Custom Company Templates',
      'Team Management Dashboard',
      'Bulk User Invites',
      'White-label Reports',
      'API Access',
      'Dedicated Account Manager',
      'SSO & SAML Integration',
      'Custom Analytics Dashboard',
      '24/7 Priority Support',
      'SLA Guarantee',
    ],
    notIncluded: [],
    cta: 'Contact Sales',
    popular: false,
    color: 'from-amber-500 to-orange-600',
  },
];

const faqs = [
  { q: 'Can I switch plans anytime?', a: 'Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately and billing is prorated.' },
  { q: 'Is there a free trial for Pro?', a: 'Yes, we offer a 7-day free trial for the Pro plan. No credit card required to start.' },
  { q: 'What payment methods do you accept?', a: 'We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and bank transfers for Enterprise plans.' },
  { q: 'Can I cancel my subscription?', a: 'Absolutely. You can cancel anytime from your account settings. Your access continues until the end of your billing period.' },
  { q: 'Do you offer student discounts?', a: 'Yes! Students get 50% off the Pro plan. Verify your student status with a valid .edu email address.' },
  { q: 'How does the AI evaluation work?', a: 'Our AI uses advanced language models to evaluate your answers on technical accuracy, communication clarity, problem-solving approach, and more.' },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

export default function PricingPage() {
  const [billing, setBilling] = useState('monthly');
  const [openFaq, setOpenFaq] = useState(null);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Hero */}
      <section className="pt-32 pb-16 px-6 text-center max-w-5xl mx-auto">
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
          <Badge variant="info" className="mb-4 px-4 py-1.5 text-sm">Simple, Transparent Pricing</Badge>
        </motion.div>
        <motion.h1 initial="hidden" animate="visible" variants={fadeUp} custom={1}
          className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
          Choose Your Path to Success
        </motion.h1>
        <motion.p initial="hidden" animate="visible" variants={fadeUp} custom={2}
          className="text-lg text-gray-400 max-w-2xl mx-auto mb-10">
          Whether you're just starting or preparing for your dream job, we have a plan that fits your needs.
        </motion.p>

        {/* Billing Toggle */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={3}
          className="inline-flex items-center gap-4 bg-white/5 border border-white/10 rounded-full p-1.5">
          <button onClick={() => setBilling('monthly')}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${billing === 'monthly' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25' : 'text-gray-400 hover:text-white'}`}>
            Monthly
          </button>
          <button onClick={() => setBilling('yearly')}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${billing === 'yearly' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25' : 'text-gray-400 hover:text-white'}`}>
            Yearly <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">Save 17%</span>
          </button>
        </motion.div>
      </section>

      {/* Pricing Cards */}
      <section className="max-w-7xl mx-auto px-6 pb-24">
        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan, i) => (
            <motion.div key={plan.name} initial="hidden" whileInView="visible" viewport={{ once: true }}
              variants={fadeUp} custom={i} className="relative">
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                  <span className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg shadow-blue-500/25">
                    Most Popular
                  </span>
                </div>
              )}
              <Card className={`h-full flex flex-col ${plan.popular ? 'border-blue-500/40 shadow-xl shadow-blue-500/10 scale-105' : ''}`}>
                <div className="p-8">
                  <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                  <p className="text-sm text-gray-400 mb-6">{plan.description}</p>
                  <div className="mb-8">
                    <span className="text-5xl font-bold">${billing === 'monthly' ? plan.price.monthly : plan.price.yearly}</span>
                    <span className="text-gray-400 ml-2">/{billing === 'monthly' ? 'mo' : 'yr'}</span>
                    {billing === 'yearly' && plan.price.monthly > 0 && (
                      <p className="text-xs text-green-400 mt-1">
                        ${(plan.price.yearly / 12).toFixed(2)}/mo billed annually
                      </p>
                    )}
                  </div>
                  <Button onClick={() => navigate('/register')}
                    className={`w-full bg-gradient-to-r ${plan.color} ${plan.popular ? 'shadow-lg shadow-blue-500/25' : ''}`}
                    variant={plan.popular ? 'primary' : 'secondary'}>
                    {plan.cta}
                  </Button>
                </div>
                <div className="px-8 pb-8 flex-1">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">What's included:</p>
                  <ul className="space-y-3">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-3 text-sm">
                        <svg className="w-5 h-5 text-green-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-gray-300">{f}</span>
                      </li>
                    ))}
                    {plan.notIncluded.map((f) => (
                      <li key={f} className="flex items-start gap-3 text-sm">
                        <svg className="w-5 h-5 text-gray-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        <span className="text-gray-600">{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Feature Comparison Table */}
      <section className="max-w-5xl mx-auto px-6 pb-24">
        <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="text-3xl font-bold text-center mb-12">Feature Comparison</motion.h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-4 px-4 text-gray-400 font-medium">Feature</th>
                <th className="text-center py-4 px-4 text-gray-400 font-medium">Free</th>
                <th className="text-center py-4 px-4 text-blue-400 font-medium">Pro</th>
                <th className="text-center py-4 px-4 text-amber-400 font-medium">Enterprise</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['Resume ATS Analysis', '1', 'Unlimited', 'Unlimited'],
                ['Aptitude Questions/day', '10', 'Unlimited', 'Unlimited'],
                ['Coding Problems/day', '3', 'Unlimited', 'Unlimited'],
                ['Technical Interview', 'Basic', 'All Modules', 'All Modules'],
                ['Voice Interview Mode', false, true, true],
                ['Company-Specific Mode', false, '6 Companies', 'Custom + 6'],
                ['Analytics Dashboard', 'Basic', 'Advanced', 'Custom'],
                ['PDF Report Export', false, true, true],
                ['AI Learning Path', false, true, true],
                ['Team Management', false, false, true],
                ['API Access', false, false, true],
                ['White-label Reports', false, false, true],
                ['Support', 'Community', 'Priority Email', '24/7 Dedicated'],
              ].map(([feature, free, pro, enterprise], i) => (
                <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02]">
                  <td className="py-3.5 px-4 text-gray-300">{feature}</td>
                  <td className="py-3.5 px-4 text-center">
                    {typeof free === 'boolean' ? (free ? <CheckIcon /> : <XIcon />) : <span className="text-gray-400">{free}</span>}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    {typeof pro === 'boolean' ? (pro ? <CheckIcon /> : <XIcon />) : <span className="text-blue-400">{pro}</span>}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    {typeof enterprise === 'boolean' ? (enterprise ? <CheckIcon /> : <XIcon />) : <span className="text-amber-400">{enterprise}</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-6 pb-24">
        <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</motion.h2>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
              <Card className="overflow-hidden cursor-pointer" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                <div className="p-5">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-gray-200">{faq.q}</h4>
                    <motion.span animate={{ rotate: openFaq === i ? 180 : 0 }} className="text-gray-400">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </motion.span>
                  </div>
                  <AnimatePresence>
                    {openFaq === i && (
                      <motion.p initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }} className="text-sm text-gray-400 mt-3 overflow-hidden">
                        {faq.a}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-6 pb-24 text-center">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
          className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/20 rounded-2xl p-12">
          <h2 className="text-3xl font-bold mb-4">Ready to Ace Your Next Interview?</h2>
          <p className="text-gray-400 mb-8 max-w-xl mx-auto">Join thousands of candidates who have successfully prepared for their dream jobs using our AI-powered platform.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={() => navigate('/register')} className="bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg shadow-blue-500/25 px-8">
              Start Free Today
            </Button>
            <Button onClick={() => navigate('/login')} variant="secondary" className="px-8">
              Sign In
            </Button>
          </div>
        </motion.div>
      </section>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg className="w-5 h-5 text-green-400 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg className="w-5 h-5 text-gray-600 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}
