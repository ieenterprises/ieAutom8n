<script setup lang="ts">
import { VIEWS } from '@/app/constants';
import { useDocumentTitle } from '@/app/composables/useDocumentTitle';
import { onMounted } from 'vue';

const documentTitle = useDocumentTitle();

onMounted(() => {
	documentTitle.set('ieAutom8n — Enterprise Automation Platform by ieEnterprises');
});
</script>

<template>
	<div class="landing-page">
		<!-- Glow Background Orbs -->
		<div class="glow-orb glow-orb-left" />
		<div class="glow-orb glow-orb-right" />

		<!-- Header / Navigation -->
		<header class="header">
			<div class="header-container">
				<!-- Brand Logo -->
				<div class="brand">
					<div class="logo-box">
						<img
							src="https://raw.githubusercontent.com/ieenterprises/logo/main/Company%20Logo%203.png"
							alt="ieAutom8n Logo"
							class="logo-img"
						/>
					</div>
					<div class="brand-text-col">
						<span class="brand-name">
							ieAutom8n
							<span class="brand-badge">by ieEnterprises</span>
						</span>
					</div>
				</div>

				<!-- Nav Links -->
				<nav class="nav-links">
					<a href="#features">Features</a>
					<a href="#solutions">Solutions</a>
					<a href="#canvas">Workflow Canvas</a>
					<a href="#pricing">Pricing</a>
					<a href="#faq">FAQ</a>
				</nav>

				<!-- Header Actions: Sign In & Sign Up -->
				<div class="header-actions">
					<router-link :to="{ name: VIEWS.SIGNIN }" class="btn-signin">
						Sign In
					</router-link>
					<router-link :to="{ name: VIEWS.SIGNUP }" class="btn-signup">
						<span>Get Started</span>
						<svg class="icon-arrow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
						</svg>
					</router-link>
				</div>
			</div>
		</header>

		<!-- Hero Section -->
		<section class="hero-section">
			<div class="hero-container">
				<div class="pill-badge">
					<span class="pill-dot" />
					<span>Next-Generation Workflow Automation & AI Agents</span>
				</div>

				<h1 class="hero-title">
					Automate Without Limits. <br />
					<span class="gradient-text">Powered by ieAutom8n.</span>
				</h1>

				<p class="hero-subtitle">
					Connect 400+ enterprise applications, orchestrate autonomous AI agents, and build complex
					mission-critical workflows with PostgreSQL reliability.
				</p>

				<!-- Hero CTA Buttons -->
				<div class="hero-cta-group">
					<router-link :to="{ name: VIEWS.SIGNUP }" class="btn-hero-primary">
						<span>Get Started Free</span>
						<svg class="icon-arrow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
						</svg>
					</router-link>
					<router-link :to="{ name: VIEWS.SIGNIN }" class="btn-hero-secondary">
						<span>Sign In to Workspace</span>
					</router-link>
				</div>

				<!-- Trust Badges -->
				<div class="trust-row">
					<div class="trust-item">
						<span class="trust-check">✓</span>
						<span>PostgreSQL Persistent Storage</span>
					</div>
					<div class="trust-item">
						<span class="trust-check">✓</span>
						<span>256-Bit Credential Encryption</span>
					</div>
					<div class="trust-item">
						<span class="trust-check">✓</span>
						<span>400+ Enterprise Connectors</span>
					</div>
				</div>
			</div>
		</section>

		<!-- Simulated Canvas Showcase -->
		<section id="canvas" class="canvas-section">
			<div class="canvas-window">
				<div class="canvas-header">
					<div class="window-controls">
						<span class="dot red" />
						<span class="dot yellow" />
						<span class="dot green" />
						<span class="window-title">ieAutom8n Studio — [Inbound Lead & AI Triage Pipeline]</span>
					</div>
					<div class="window-status">
						<span class="status-live"><span class="status-pulse" /> Active Pipeline</span>
					</div>
				</div>

				<div class="canvas-body">
					<!-- Node 1 -->
					<div class="canvas-node">
						<div class="node-header">
							<span class="node-icon orange">⚡</span>
							<div>
								<div class="node-type">TRIGGER</div>
								<div class="node-title">Webhook (Inbound Lead)</div>
							</div>
						</div>
						<div class="node-footer">
							<span>POST /leads</span>
							<span class="status-badge success">200 OK</span>
						</div>
					</div>

					<div class="canvas-connector" />

					<!-- Node 2 -->
					<div class="canvas-node highlight">
						<div class="node-header">
							<span class="node-icon purple">🤖</span>
							<div>
								<div class="node-type purple">AI LOGIC</div>
								<div class="node-title">Autonomous Agent</div>
							</div>
						</div>
						<div class="node-desc">Claude 3.5 / GPT-4o Intent Scorer</div>
						<div class="node-footer">
							<span>Status: High Priority</span>
							<span class="status-badge purple">0.34s</span>
						</div>
					</div>

					<div class="canvas-connector" />

					<!-- Node 3 -->
					<div class="canvas-node">
						<div class="node-header">
							<span class="node-icon blue">🗄️</span>
							<div>
								<div class="node-type">DATABASE</div>
								<div class="node-title">PostgreSQL Database</div>
							</div>
						</div>
						<div class="node-footer">
							<span>Table: leads</span>
							<span class="status-badge success">Saved</span>
						</div>
					</div>

					<div class="canvas-connector" />

					<!-- Node 4 -->
					<div class="canvas-node">
						<div class="node-header">
							<span class="node-icon pink">💬</span>
							<div>
								<div class="node-type">NOTIFICATION</div>
								<div class="node-title">Slack & Email Alert</div>
							</div>
						</div>
						<div class="node-footer">
							<span>#sales-alerts</span>
							<span class="status-badge success">Delivered</span>
						</div>
					</div>
				</div>
			</div>
		</section>

		<!-- Features Grid -->
		<section id="features" class="features-section">
			<div class="section-header">
				<div class="section-tag">UNMATCHED CAPABILITIES</div>
				<h2 class="section-title">Everything You Need to Automate at Scale</h2>
				<p class="section-subtitle">
					ieAutom8n gives your team enterprise-grade flexibility with no hidden fees or execution caps.
				</p>
			</div>

			<div class="features-grid">
				<div class="feature-card">
					<div class="feature-icon">🤖</div>
					<h3 class="feature-title">Native AI Agents & LLMs</h3>
					<p class="feature-desc">
						Integrate OpenAI, Anthropic, Gemini, and open-source models directly into your workflows.
						Build agents with memory, vector databases, and custom tool calling.
					</p>
				</div>

				<div class="feature-card">
					<div class="feature-icon">🗄️</div>
					<h3 class="feature-title">PostgreSQL Persistence</h3>
					<p class="feature-desc">
						Backed by high-performance PostgreSQL for bulletproof transaction reliability, persistent
						executions, and workflows that never disappear.
					</p>
				</div>

				<div class="feature-card">
					<div class="feature-icon">🔒</div>
					<h3 class="feature-title">Zero-Trust Credential Security</h3>
					<p class="feature-desc">
						All API keys, OAuth tokens, and connection secrets are encrypted at rest with 256-bit encryption.
						Zero vendor lock-in.
					</p>
				</div>

				<div class="feature-card">
					<div class="feature-icon">⚡</div>
					<h3 class="feature-title">JavaScript & Python Execution</h3>
					<p class="feature-desc">
						Write standard JavaScript or Python blocks, manipulate arbitrary JSON, transform data structures,
						and implement custom algorithms.
					</p>
				</div>

				<div class="feature-card">
					<div class="feature-icon">👥</div>
					<h3 class="feature-title">Multi-User RBAC & Roles</h3>
					<p class="feature-desc">
						Invite team members, assign fine-grained roles (Admin, Member, Editor), share projects, and
						collaborate safely.
					</p>
				</div>

				<div class="feature-card">
					<div class="feature-icon">🌐</div>
					<h3 class="feature-title">Dedicated ieAutom8n API</h3>
					<p class="feature-desc">
						Trigger workflows and manage jobs programmatically using the built-in ieAutom8n REST API and secure
						API tokens.
					</p>
				</div>
			</div>
		</section>

		<!-- Solutions by Department -->
		<section id="solutions" class="solutions-section">
			<div class="section-header">
				<div class="section-tag">SOLUTIONS</div>
				<h2 class="section-title">Built for Every Department</h2>
			</div>

			<div class="solutions-grid">
				<div class="solution-card">
					<div class="solution-icon">📈</div>
					<h4 class="solution-title">Sales & Marketing</h4>
					<p class="solution-desc">Automate lead enrichment, CRM syncing, and automated follow-ups.</p>
				</div>
				<div class="solution-card">
					<div class="solution-icon">🛠️</div>
					<h4 class="solution-title">DevOps & Cloud</h4>
					<p class="solution-desc">Monitor infrastructure, trigger CI/CD jobs, and sync alerts to team chat.</p>
				</div>
				<div class="solution-card">
					<div class="solution-icon">🤝</div>
					<h4 class="solution-title">Customer Support</h4>
					<p class="solution-desc">Auto-triage inbound tickets using AI and draft contextual solutions.</p>
				</div>
				<div class="solution-card">
					<div class="solution-icon">📊</div>
					<h4 class="solution-title">Finance & Ops</h4>
					<p class="solution-desc">Extract invoice data with AI, reconcile payments, and schedule weekly digests.</p>
				</div>
			</div>
		</section>

		<!-- Pricing Section -->
		<section id="pricing" class="pricing-section">
			<div class="section-header">
				<div class="section-tag">PREDICTABLE PRICING</div>
				<h2 class="section-title">Flexible Plans for Every Stage</h2>
				<p class="section-subtitle">
					Run on your managed cloud or let ieEnterprises build tailored automations for your organization.
				</p>
			</div>

			<div class="pricing-grid">
				<!-- Free Plan -->
				<div class="pricing-card">
					<h3 class="plan-name">Starter Community</h3>
					<p class="plan-desc">For individuals & founders exploring automation.</p>
					<div class="plan-price">
						<span class="price-val">Free</span>
						<span class="price-unit">/ self-hosted</span>
					</div>
					<ul class="plan-features">
						<li>✓ Full ieAutom8n Workflow Canvas</li>
						<li>✓ 400+ Pre-built Integrations</li>
						<li>✓ Community Support</li>
					</ul>
					<router-link :to="{ name: VIEWS.SIGNUP }" class="btn-plan-secondary">
						Get Started Free
					</router-link>
				</div>

				<!-- Pro Plan -->
				<div class="pricing-card featured">
					<div class="featured-badge">MOST POPULAR</div>
					<h3 class="plan-name">Professional</h3>
					<p class="plan-desc">For growing businesses needing persistent cloud reliability.</p>
					<div class="plan-price">
						<span class="price-val">$49</span>
						<span class="price-unit">/ month</span>
					</div>
					<ul class="plan-features">
						<li>✓ Managed PostgreSQL Persistence</li>
						<li>✓ Automated Password Reset (SMTP)</li>
						<li>✓ Unlimited Workflow Executions</li>
						<li>✓ Priority Support by ieEnterprises</li>
					</ul>
					<a
						href="mailto:ieenterprises.ai@gmail.com?subject=Inquiry%20about%20ieAutom8n%20Professional"
						class="btn-plan-primary"
					>
						Contact ieEnterprises
					</a>
				</div>

				<!-- Enterprise Plan -->
				<div class="pricing-card">
					<h3 class="plan-name">Enterprise</h3>
					<p class="plan-desc">For mission-critical operations requiring custom engineering.</p>
					<div class="plan-price">
						<span class="price-val">Custom</span>
					</div>
					<ul class="plan-features">
						<li>✓ Bespoke Workflow & Node Development</li>
						<li>✓ Dedicated PostgreSQL Database Cluster</li>
						<li>✓ Custom Domain & SSO Integration</li>
						<li>✓ Dedicated Solutions Architect & SLA</li>
					</ul>
					<a
						href="mailto:ieenterprises.ai@gmail.com?subject=Enterprise%20Inquiry%20for%20ieAutom8n"
						class="btn-plan-secondary"
					>
						Talk to Founders
					</a>
				</div>
			</div>
		</section>

		<!-- FAQ Section -->
		<section id="faq" class="faq-section">
			<div class="section-header">
				<div class="section-tag">FAQ</div>
				<h2 class="section-title">Frequently Asked Questions</h2>
			</div>

			<div class="faq-list">
				<details class="faq-item">
					<summary class="faq-question">
						<span>How do I create an account or sign up?</span>
						<span class="faq-chevron">▼</span>
					</summary>
					<p class="faq-answer">
						Click the "Get Started" button at the top of the page. If this instance is newly launched, you
						will be prompted to set up the Owner account; otherwise, you can register a new user account.
					</p>
				</details>

				<details class="faq-item">
					<summary class="faq-question">
						<span>How does password recovery work?</span>
						<span class="faq-chevron">▼</span>
					</summary>
					<p class="faq-answer">
						With SMTP email enabled, users can click "Forgot password?" on the Sign In page to receive a secure
						password reset link via email. System administrators can also reset passwords directly.
					</p>
				</details>

				<details class="faq-item">
					<summary class="faq-question">
						<span>Where is workflow data and credentials stored?</span>
						<span class="faq-chevron">▼</span>
					</summary>
					<p class="faq-answer">
						All workflows, credentials, and user data are stored inside your connected PostgreSQL database with
						256-bit encryption.
					</p>
				</details>

				<details class="faq-item">
					<summary class="faq-question">
						<span>Can ieEnterprises build custom workflows for my business?</span>
						<span class="faq-chevron">▼</span>
					</summary>
					<p class="faq-answer">
						Yes! Our engineers build custom automations, AI pipelines, and custom API connectors. Contact us
						directly at <a href="mailto:ieenterprises.ai@gmail.com">ieenterprises.ai@gmail.com</a>.
					</p>
				</details>
			</div>
		</section>

		<!-- Big Final CTA -->
		<section class="final-cta-section">
			<div class="final-cta-box">
				<h2 class="final-cta-title">
					Ready to Automate with <br />
					<span class="gradient-text">ieAutom8n?</span>
				</h2>
				<p class="final-cta-desc">
					Start building resilient, AI-powered automated workflows today with ieEnterprises.
				</p>
				<div class="final-cta-buttons">
					<router-link :to="{ name: VIEWS.SIGNUP }" class="btn-hero-primary">
						Get Started Free
					</router-link>
					<router-link :to="{ name: VIEWS.SIGNIN }" class="btn-hero-secondary">
						Sign In
					</router-link>
				</div>
			</div>
		</section>

		<!-- Footer -->
		<footer class="footer">
			<div class="footer-container">
				<div class="footer-brand">
					<img
						src="https://raw.githubusercontent.com/ieenterprises/logo/main/Company%20Logo%203.png"
						alt="ieEnterprises"
						class="footer-logo"
					/>
					<span class="footer-title">ieAutom8n</span>
					<span class="footer-sep">—</span>
					<span>Enterprise Automation Platform</span>
				</div>

				<div class="footer-links">
					<a href="#features">Features</a>
					<a href="#solutions">Solutions</a>
					<a href="#pricing">Pricing</a>
					<router-link :to="{ name: VIEWS.SIGNIN }">Sign In</router-link>
					<router-link :to="{ name: VIEWS.SIGNUP }">Sign Up</router-link>
					<a href="mailto:ieenterprises.ai@gmail.com">Support</a>
				</div>

				<div class="footer-copy">© 2026 ieEnterprises. All rights reserved.</div>
			</div>
		</footer>
	</div>
</template>

<style lang="scss" scoped>
.landing-page {
	position: relative;
	min-height: 100vh;
	width: 100%;
	background-color: #f8fafc;
	color: #0f172a;
	font-family: inherit;
	overflow-x: hidden;
	line-height: 1.6;
}

/* Glow Orbs */
.glow-orb {
	position: absolute;
	border-radius: 9999px;
	pointer-events: none;
	filter: blur(140px);
	z-index: 0;
}
.glow-orb-left {
	top: -100px;
	left: 20%;
	width: 480px;
	height: 480px;
	background: rgba(139, 92, 246, 0.08);
}
.glow-orb-right {
	top: -60px;
	right: 20%;
	width: 420px;
	height: 420px;
	background: rgba(124, 58, 237, 0.07);
}

/* Header */
.header {
	position: sticky;
	top: 0;
	z-index: 50;
	backdrop-filter: blur(16px);
	background: rgba(255, 255, 255, 0.92);
	border-bottom: 1px solid #e2e8f0;
	box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
}
.header-container {
	max-width: 1200px;
	margin: 0 auto;
	height: 76px;
	padding: 0 24px;
	display: flex;
	align-items: center;
	justify-content: space-between;
}
.brand {
	display: flex;
	align-items: center;
	gap: 12px;
	text-decoration: none;
}
.logo-box {
	width: 40px;
	height: 40px;
	border-radius: 12px;
	background: #f5f3ff;
	border: 1px solid rgba(139, 92, 246, 0.3);
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 6px;
}
.logo-img {
	width: 100%;
	height: 100%;
	object-fit: contain;
}
.brand-name {
	font-size: 20px;
	font-weight: 800;
	color: #0f172a;
	display: flex;
	align-items: center;
	gap: 8px;
}
.brand-badge {
	font-size: 10px;
	font-weight: 700;
	text-transform: uppercase;
	letter-spacing: 0.05em;
	padding: 2px 8px;
	border-radius: 9999px;
	background: #f5f3ff;
	border: 1px solid #ddd6fe;
	color: #7c3aed;
}

.nav-links {
	display: none;
	align-items: center;
	gap: 28px;
	font-size: 14px;
	font-weight: 600;
	color: #475569;

	a {
		color: inherit;
		text-decoration: none;
		transition: color 0.2s;
		&:hover {
			color: #7c3aed;
		}
	}

	@media (min-width: 768px) {
		display: flex;
	}
}

.header-actions {
	display: flex;
	align-items: center;
	gap: 12px;
}
.btn-signin {
	padding: 8px 16px;
	font-size: 14px;
	font-weight: 600;
	color: #475569;
	text-decoration: none;
	border-radius: 8px;
	transition: color 0.2s;
	&:hover {
		color: #0f172a;
	}
}
.btn-signup {
	padding: 9px 18px;
	font-size: 14px;
	font-weight: 700;
	color: #fff;
	background: linear-gradient(135deg, #7c3aed, #8b5cf6);
	border-radius: 10px;
	text-decoration: none;
	display: flex;
	align-items: center;
	gap: 6px;
	box-shadow: 0 4px 14px rgba(139, 92, 246, 0.35);
	transition: transform 0.2s, box-shadow 0.2s;
	&:hover {
		transform: scale(1.02);
		box-shadow: 0 6px 20px rgba(139, 92, 246, 0.5);
	}
}
.icon-arrow {
	width: 16px;
	height: 16px;
}

/* Hero Section */
.hero-section {
	position: relative;
	padding: 80px 24px 60px;
	text-align: center;
	z-index: 10;
}
.hero-container {
	max-width: 900px;
	margin: 0 auto;
}
.pill-badge {
	display: inline-flex;
	align-items: center;
	gap: 8px;
	padding: 6px 16px;
	border-radius: 9999px;
	background: #f5f3ff;
	border: 1px solid #ddd6fe;
	color: #7c3aed;
	font-size: 13px;
	font-weight: 600;
	margin-bottom: 28px;
}
.pill-dot {
	width: 8px;
	height: 8px;
	border-radius: 9999px;
	background: #8b5cf6;
}
.hero-title {
	font-size: 42px;
	font-weight: 800;
	line-height: 1.15;
	color: #0f172a;
	letter-spacing: -0.02em;
	margin: 0;

	@media (min-width: 640px) {
		font-size: 58px;
	}
}
.gradient-text {
	background: linear-gradient(135deg, #7c3aed, #8b5cf6, #6366f1);
	-webkit-background-clip: text;
	-webkit-text-fill-color: transparent;
}
.hero-subtitle {
	margin-top: 24px;
	font-size: 18px;
	color: #475569;
	max-width: 720px;
	margin-left: auto;
	margin-right: auto;
}
.hero-cta-group {
	margin-top: 36px;
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	justify-content: center;
	gap: 16px;
}
.btn-hero-primary {
	padding: 14px 28px;
	font-size: 16px;
	font-weight: 700;
	color: #fff;
	background: linear-gradient(135deg, #7c3aed, #8b5cf6);
	border-radius: 12px;
	text-decoration: none;
	display: inline-flex;
	align-items: center;
	gap: 8px;
	box-shadow: 0 4px 18px rgba(139, 92, 246, 0.4);
	transition: transform 0.2s, box-shadow 0.2s;
	&:hover {
		transform: scale(1.02);
		box-shadow: 0 6px 24px rgba(139, 92, 246, 0.55);
	}
}
.btn-hero-secondary {
	padding: 14px 28px;
	font-size: 16px;
	font-weight: 600;
	color: #334155;
	background: #ffffff;
	border: 1px solid #cbd5e1;
	border-radius: 12px;
	text-decoration: none;
	box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
	transition: background 0.2s, border-color 0.2s, color 0.2s;
	&:hover {
		background: #f8fafc;
		border-color: #8b5cf6;
		color: #7c3aed;
	}
}
.trust-row {
	margin-top: 48px;
	padding-top: 28px;
	border-top: 1px solid #e2e8f0;
	display: flex;
	flex-wrap: wrap;
	justify-content: center;
	gap: 24px 40px;
	color: #64748b;
	font-size: 14px;
	font-weight: 500;
}
.trust-item {
	display: flex;
	align-items: center;
	gap: 8px;
}
.trust-check {
	color: #7c3aed;
	font-weight: 800;
}

/* Canvas Mockup Section */
.canvas-section {
	max-width: 1100px;
	margin: 30px auto 80px;
	padding: 0 24px;
}
.canvas-window {
	border-radius: 16px;
	border: 1px solid #e2e8f0;
	background: #ffffff;
	box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.08);
	overflow: hidden;
}
.canvas-header {
	padding: 12px 18px;
	background: #f8fafc;
	border-bottom: 1px solid #e2e8f0;
	display: flex;
	align-items: center;
	justify-content: space-between;
}
.window-controls {
	display: flex;
	align-items: center;
	gap: 8px;
}
.dot {
	width: 10px;
	height: 10px;
	border-radius: 9999px;
}
.dot.red { background: #ef4444; }
.dot.yellow { background: #eab308; }
.dot.green { background: #10b981; }
.window-title {
	margin-left: 12px;
	font-size: 12px;
	font-family: monospace;
	color: #64748b;
}
.status-live {
	font-size: 12px;
	font-weight: 600;
	color: #059669;
	background: #ecfdf5;
	border: 1px solid #a7f3d0;
	padding: 3px 10px;
	border-radius: 6px;
	display: inline-flex;
	align-items: center;
	gap: 6px;
}
.status-pulse {
	width: 6px;
	height: 6px;
	border-radius: 9999px;
	background: #10b981;
}
.canvas-body {
	padding: 40px 24px;
	background: #fafbfe;
	display: flex;
	flex-direction: column;
	gap: 20px;
	align-items: center;
	justify-content: space-between;

	@media (min-width: 900px) {
		flex-direction: row;
		gap: 12px;
	}
}
.canvas-node {
	width: 210px;
	background: #ffffff;
	border: 1px solid #e2e8f0;
	border-radius: 12px;
	padding: 14px;
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
	transition: border-color 0.2s;

	&.highlight {
		border: 2px solid #8b5cf6;
		box-shadow: 0 0 25px -5px rgba(139, 92, 246, 0.25);
	}
}
.node-header {
	display: flex;
	align-items: center;
	gap: 10px;
	margin-bottom: 8px;
}
.node-icon {
	width: 32px;
	height: 32px;
	border-radius: 8px;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 14px;
	font-weight: 700;

	&.orange { background: #fff7ed; color: #ea580c; }
	&.purple { background: #f5f3ff; color: #7c3aed; }
	&.blue { background: #eff6ff; color: #2563eb; }
	&.pink { background: #fdf2f8; color: #db2777; }
}
.node-type {
	font-size: 9px;
	font-weight: 800;
	color: #64748b;
	letter-spacing: 0.05em;

	&.purple { color: #7c3aed; }
}
.node-title {
	font-size: 13px;
	font-weight: 700;
	color: #0f172a;
}
.node-desc {
	font-size: 11px;
	color: #475569;
	margin-bottom: 8px;
}
.node-footer {
	border-top: 1px solid #f1f5f9;
	padding-top: 8px;
	font-size: 11px;
	color: #64748b;
	display: flex;
	justify-content: space-between;
	align-items: center;
}
.status-badge {
	font-family: monospace;
	font-size: 10px;
	font-weight: 600;

	&.success { color: #059669; }
	&.purple { color: #7c3aed; }
}
.canvas-connector {
	display: none;
	width: 24px;
	height: 2px;
	background: linear-gradient(to right, #8b5cf6, #38bdf8);

	@media (min-width: 900px) {
		display: block;
	}
}

/* Features Section */
.features-section,
.solutions-section,
.pricing-section,
.faq-section {
	max-width: 1200px;
	margin: 0 auto;
	padding: 80px 24px;
}
.section-header {
	text-align: center;
	max-width: 680px;
	margin: 0 auto 50px;
}
.section-tag {
	font-size: 11px;
	font-weight: 800;
	text-transform: uppercase;
	letter-spacing: 0.1em;
	color: #7c3aed;
	margin-bottom: 8px;
}
.section-title {
	font-size: 34px;
	font-weight: 800;
	color: #0f172a;
	margin: 0;
	letter-spacing: -0.01em;
}
.section-subtitle {
	font-size: 16px;
	color: #475569;
	margin-top: 14px;
}

.features-grid {
	display: grid;
	grid-template-columns: 1fr;
	gap: 24px;

	@media (min-width: 640px) {
		grid-template-columns: repeat(2, 1fr);
	}
	@media (min-width: 1024px) {
		grid-template-columns: repeat(3, 1fr);
	}
}
.feature-card {
	background: #ffffff;
	border: 1px solid #e2e8f0;
	border-radius: 16px;
	padding: 28px;
	box-shadow: 0 2px 6px rgba(0, 0, 0, 0.02);
	transition: border-color 0.2s, transform 0.2s, box-shadow 0.2s;
	&:hover {
		border-color: #8b5cf6;
		transform: translateY(-4px);
		box-shadow: 0 10px 25px -5px rgba(139, 92, 246, 0.15);
	}
}
.feature-icon {
	font-size: 26px;
	margin-bottom: 16px;
}
.feature-title {
	font-size: 18px;
	font-weight: 700;
	color: #0f172a;
	margin-bottom: 8px;
}
.feature-desc {
	font-size: 14px;
	color: #475569;
	line-height: 1.5;
}

/* Solutions */
.solutions-grid {
	display: grid;
	grid-template-columns: 1fr;
	gap: 20px;

	@media (min-width: 640px) {
		grid-template-columns: repeat(2, 1fr);
	}
	@media (min-width: 1024px) {
		grid-template-columns: repeat(4, 1fr);
	}
}
.solution-card {
	background: #ffffff;
	border: 1px solid #e2e8f0;
	border-radius: 14px;
	padding: 24px;
	box-shadow: 0 2px 6px rgba(0, 0, 0, 0.02);
}
.solution-icon {
	font-size: 24px;
	margin-bottom: 12px;
}
.solution-title {
	font-size: 16px;
	font-weight: 700;
	color: #0f172a;
	margin-bottom: 6px;
}
.solution-desc {
	font-size: 13px;
	color: #64748b;
}

/* Pricing Grid */
.pricing-grid {
	display: grid;
	grid-template-columns: 1fr;
	gap: 28px;

	@media (min-width: 1024px) {
		grid-template-columns: repeat(3, 1fr);
	}
}
.pricing-card {
	background: #ffffff;
	border: 1px solid #e2e8f0;
	border-radius: 18px;
	padding: 32px;
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	position: relative;
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);

	&.featured {
		border: 2px solid #8b5cf6;
		box-shadow: 0 12px 30px -5px rgba(139, 92, 246, 0.2);
	}
}
.featured-badge {
	position: absolute;
	top: -12px;
	left: 50%;
	transform: translateX(-50%);
	background: #7c3aed;
	color: #fff;
	font-size: 10px;
	font-weight: 800;
	letter-spacing: 0.08em;
	padding: 3px 12px;
	border-radius: 9999px;
}
.plan-name {
	font-size: 22px;
	font-weight: 800;
	color: #0f172a;
	margin: 0;
}
.plan-desc {
	font-size: 13px;
	color: #64748b;
	margin-top: 4px;
}
.plan-price {
	margin: 24px 0;
	display: flex;
	align-items: baseline;
	gap: 8px;
}
.price-val {
	font-size: 38px;
	font-weight: 800;
	color: #0f172a;
}
.price-unit {
	font-size: 13px;
	color: #64748b;
}
.plan-features {
	list-style: none;
	padding: 0;
	margin: 0 0 28px;
	display: flex;
	flex-direction: column;
	gap: 12px;
	font-size: 14px;
	color: #334155;
}
.btn-plan-primary {
	width: 100%;
	padding: 12px;
	text-align: center;
	border-radius: 10px;
	font-size: 15px;
	font-weight: 700;
	color: #fff;
	background: linear-gradient(135deg, #7c3aed, #8b5cf6);
	text-decoration: none;
	box-shadow: 0 4px 14px rgba(139, 92, 246, 0.35);
	transition: transform 0.2s;
	&:hover {
		transform: scale(1.02);
	}
}
.btn-plan-secondary {
	width: 100%;
	padding: 12px;
	text-align: center;
	border-radius: 10px;
	font-size: 15px;
	font-weight: 600;
	color: #334155;
	background: #f1f5f9;
	border: 1px solid #cbd5e1;
	text-decoration: none;
	transition: background 0.2s, color 0.2s;
	&:hover {
		background: #e2e8f0;
		color: #0f172a;
	}
}

/* FAQ */
.faq-list {
	max-width: 800px;
	margin: 0 auto;
	display: flex;
	flex-direction: column;
	gap: 16px;
}
.faq-item {
	background: #ffffff;
	border: 1px solid #e2e8f0;
	border-radius: 12px;
	padding: 20px 24px;
	box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
}
.faq-question {
	font-weight: 700;
	color: #0f172a;
	font-size: 15px;
	cursor: pointer;
	display: flex;
	justify-content: space-between;
	align-items: center;
	list-style: none;
}
.faq-chevron {
	font-size: 11px;
	color: #7c3aed;
}
.faq-answer {
	margin-top: 12px;
	font-size: 14px;
	color: #475569;
	line-height: 1.6;

	a {
		color: #7c3aed;
		text-decoration: underline;
	}
}

/* Final CTA */
.final-cta-section {
	max-width: 1000px;
	margin: 40px auto 80px;
	padding: 0 24px;
}
.final-cta-box {
	background: linear-gradient(135deg, #f5f3ff, #ede9fe);
	border: 1px solid rgba(139, 92, 246, 0.35);
	border-radius: 24px;
	padding: 50px 24px;
	text-align: center;
	box-shadow: 0 15px 35px -5px rgba(139, 92, 246, 0.15);
}
.final-cta-title {
	font-size: 38px;
	font-weight: 800;
	color: #0f172a;
	margin: 0;
}
.final-cta-desc {
	margin: 16px auto 28px;
	max-width: 580px;
	color: #475569;
	font-size: 16px;
}
.final-cta-buttons {
	display: flex;
	flex-wrap: wrap;
	justify-content: center;
	gap: 16px;
}

/* Footer */
.footer {
	border-top: 1px solid #e2e8f0;
	background: #ffffff;
	padding: 40px 24px;
	font-size: 13px;
	color: #64748b;
}
.footer-container {
	max-width: 1200px;
	margin: 0 auto;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: space-between;
	gap: 20px;

	@media (min-width: 768px) {
		flex-direction: row;
	}
}
.footer-brand {
	display: flex;
	align-items: center;
	gap: 8px;
}
.footer-logo {
	width: 24px;
	height: 24px;
	object-fit: contain;
}
.footer-title {
	font-weight: 700;
	color: #0f172a;
}
.footer-sep {
	color: #cbd5e1;
}
.footer-links {
	display: flex;
	flex-wrap: wrap;
	gap: 20px;

	a {
		color: #64748b;
		text-decoration: none;
		transition: color 0.2s;
		&:hover {
			color: #7c3aed;
		}
	}
}
.footer-copy {
	color: #94a3b8;
	font-size: 12px;
}
</style>
