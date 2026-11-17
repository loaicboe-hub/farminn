import { escapeHtml } from '../../foundation/security/input-sanitizer.mjs';

function formatEgp(val) {
  if (!val) return '0';
  return Number(val).toLocaleString('en-US');
}

export function renderHomePage({ lang, farms = [], locations = [], categories = [], suppliers = [], hr = [], settings = {} }) {
  const isRtl = lang === 'ar';

  return `
    <!-- Hero Section -->
    <section style="background: linear-gradient(135deg, #132a13 0%, #1b4332 60%, #2d6a4f 100%); color: #ffffff; padding-block: var(--space-12) var(--space-16); position: relative; overflow: hidden;">
      <div style="position: absolute; inset: 0; opacity: 0.12; background-image: radial-gradient(#d97706 1px, transparent 1px); background-size: 24px 24px;"></div>
      
      <div class="container stack" style="gap: var(--space-8); position: relative; z-index: 2;">
        <div style="max-inline-size: 780px;">
          <div style="display: inline-flex; align-items: center; gap: 8px; background: rgba(217, 119, 6, 0.2); border: 1px solid rgba(217, 119, 6, 0.4); padding: 6px 14px; border-radius: 9999px; font-size: 0.85rem; font-weight: 700; color: #fde68a; margin-bottom: 1rem;">
            <span>★</span> ${isRtl ? 'المنصة المتخصصة الأولى في مصر للأراضي والمزارع' : "Egypt's Premier Dedicated Agricultural Platform"}
          </div>
          <h1 style="font-size: clamp(2.2rem, 1.8rem + 2vw, 3.4rem); font-weight: 800; line-height: 1.15; color: #ffffff; margin-bottom: 1rem; letter-spacing: -0.02em;">
            ${isRtl ? 'سوق المزارع، الإدارة الاحترافية، وفرص الاستثمار الزراعي' : 'Buy, Sell, and Manage Verified Farms Across Egypt'}
          </h1>
          <p style="font-size: 1.15rem; color: #d4ebd4; line-height: 1.6; margin: 0;">
            ${isRtl ? 'منصة فارمين تجمع بين أصحاب المزارع والمستثمرين ومديري المزارع المحترفين وكبرى شركات التوريدات الزراعية في بيئة موثقة وشفافة.' : 'Connect directly with verified farm owners, certified agronomists, joint venture investors, and equipment suppliers.'}
          </p>
        </div>

        <!-- Hero Search Filter Box -->
        <div class="hero-search-box">
          <form action="/${lang}/farms" method="GET" class="grid grid--cols-4" style="gap: var(--space-3); align-items: flex-end;">
            <div class="form-group" style="margin: 0;">
              <label class="form-label" style="font-weight: 700; font-size: 0.85rem;">
                ${isRtl ? 'الغرض' : 'Purpose'}
              </label>
              <select name="purpose" class="form-control" style="font-size: 0.9rem;">
                <option value="all">${isRtl ? 'الكل (بيع وإيجار)' : 'All (Sale & Rent)'}</option>
                <option value="sale">${isRtl ? 'مزارع للبيع' : 'Farms for Sale'}</option>
                <option value="rent">${isRtl ? 'مزارع للإيجار' : 'Farms for Rent'}</option>
              </select>
            </div>

            <div class="form-group" style="margin: 0;">
              <label class="form-label" style="font-weight: 700; font-size: 0.85rem;">
                ${isRtl ? 'المحافظة / النطاق' : 'Governorate / Region'}
              </label>
              <select name="gov" class="form-control" style="font-size: 0.9rem;">
                <option value="all">${isRtl ? 'كافة المحافظات' : 'All Governorates'}</option>
                ${locations.map(loc => `
                  <option value="${escapeHtml(loc.slug)}">${isRtl ? escapeHtml(loc.name_ar) : escapeHtml(loc.name_en)}</option>
                `).join('')}
              </select>
            </div>

            <div class="form-group" style="margin: 0;">
              <label class="form-label" style="font-weight: 700; font-size: 0.85rem;">
                ${isRtl ? 'أقل مساحة (فدان)' : 'Min Area (Feddan)'}
              </label>
              <input type="number" name="minArea" placeholder="${isRtl ? 'مثال: 10' : 'e.g. 10'}" class="form-control" style="font-size: 0.9rem;" min="0">
            </div>

            <div>
              <button type="submit" class="btn btn--primary" style="width: 100%; height: 46px; font-weight: 700; font-size: 1rem; background: var(--color-accent); border-color: var(--color-accent);">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
                ${isRtl ? 'بحث في المزارع' : 'Search Farms'}
              </button>
            </div>
          </form>
        </div>

        <!-- Quick Platform Actions -->
        <div class="cluster" style="gap: 12px; font-size: 0.9rem;">
          <span style="color: #c0d8c0; font-weight: 600;">${isRtl ? 'وصول سريع:' : 'Quick access:'}</span>
          <a href="/${lang}/quick-buy" style="color: #ffffff; text-decoration: underline; font-weight: 600;">${isRtl ? 'شراء سريع مع أصول' : 'Quick Buy with Assets'}</a>
          <span style="color: #586859;">•</span>
          <a href="/${lang}/quick-sell" style="color: #ffffff; text-decoration: underline; font-weight: 600;">${isRtl ? 'بيع سريع بمساعدة الإدارة' : 'Quick Sell Assisted'}</a>
          <span style="color: #586859;">•</span>
          <a href="/${lang}/management" style="color: #ffffff; text-decoration: underline; font-weight: 600;">${isRtl ? 'طلب إدارة وتشغيل مزرعة' : 'Request Farm Management'}</a>
        </div>
      </div>
    </section>

    <!-- Stats Ribbon -->
    <section style="background: #ffffff; border-bottom: 1px solid var(--color-border); padding-block: var(--space-6);">
      <div class="container grid grid--cols-4" style="text-align: center; gap: var(--space-4);">
        <div>
          <div style="font-size: 2.2rem; font-weight: 800; color: var(--color-primary); line-height: 1;">500+</div>
          <div style="font-size: 0.88rem; color: var(--color-text-muted); font-weight: 600; margin-top: 4px;">
            ${isRtl ? 'فدان معروض وموثق' : 'Feddans Listed'}
          </div>
        </div>
        <div>
          <div style="font-size: 2.2rem; font-weight: 800; color: var(--color-primary); line-height: 1;">100%</div>
          <div style="font-size: 0.88rem; color: var(--color-text-muted); font-weight: 600; margin-top: 4px;">
            ${isRtl ? 'معاينة وفحص أوراق الملكية' : 'Verified Legal Status'}
          </div>
        </div>
        <div>
          <div style="font-size: 2.2rem; font-weight: 800; color: var(--color-primary); line-height: 1;">15+</div>
          <div style="font-size: 0.88rem; color: var(--color-text-muted); font-weight: 600; margin-top: 4px;">
            ${isRtl ? 'استشاري وخبير زراعي معتمد' : 'Certified Agronomists'}
          </div>
        </div>
        <div>
          <div style="font-size: 2.2rem; font-weight: 800; color: var(--color-primary); line-height: 1;">8</div>
          <div style="font-size: 0.88rem; color: var(--color-text-muted); font-weight: 600; margin-top: 4px;">
            ${isRtl ? 'محافظات ومناطق استصلاح' : 'Agricultural Zones Covered'}
          </div>
        </div>
      </div>
    </section>

    <!-- Core Platform Modules Showcase -->
    <section style="padding-block: var(--space-12);">
      <div class="container stack" style="gap: var(--space-8);">
        <div style="text-align: center; max-inline-size: 700px; margin-inline: auto;">
          <h2 style="font-size: 2rem; font-weight: 800; color: var(--color-secondary); margin-bottom: 0.5rem;">
            ${isRtl ? 'منظومة فارمين المتكاملة' : 'FARMINN Integrated Ecosystem'}
          </h2>
          <p style="color: var(--color-text-muted); margin: 0;">
            ${isRtl ? 'كل ما تحتاجه لإنجاح استثمارك الزراعي تحت مظلة واحدة آمنة ومدروسة.' : 'Everything you need to buy, manage, and scale your agricultural enterprise.'}
          </p>
        </div>

        <div class="grid grid--cols-3" style="gap: var(--space-6);">
          <!-- Module 1: Farms Marketplace -->
          <div class="card stack" style="justify-content: space-between; border-top: 4px solid var(--color-primary);">
            <div class="stack" style="gap: var(--space-3);">
              <div style="width: 50px; height: 50px; border-radius: 12px; background: var(--color-primary-soft); color: var(--color-primary); display: flex; align-items: center; justify-content: center;">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3L2 12h3v8h6v-6h2v6h6v-8h3L12 3z"/></svg>
              </div>
              <h3 style="font-size: 1.25rem; font-weight: 700; margin: 0;">${isRtl ? 'سوق المزارع (بيع وإيجار)' : 'Farms Marketplace'}</h3>
              <p style="font-size: 0.9rem; color: var(--color-text-muted); line-height: 1.6; margin: 0;">
                ${isRtl ? 'تصفح مزارع منتجة وأراضٍ مستصلحة مع مواصفات فنية دقيقة لملوحة المياه، شبكات الري، مصادر الطاقة، ونوعية التربة.' : 'Verified productive orchards and reclaimed lands with verified water salinity, irrigation networks, and clear legal deeds.'}
              </p>
            </div>
            <a href="/${lang}/farms" class="btn btn--secondary btn--sm" style="margin-top: 1rem;">
              ${isRtl ? 'استعراض المزارع' : 'Browse Farms'} &rarr;
            </a>
          </div>

          <!-- Module 2: Farm Management -->
          <div class="card stack" style="justify-content: space-between; border-top: 4px solid var(--color-accent);">
            <div class="stack" style="gap: var(--space-3);">
              <div style="width: 50px; height: 50px; border-radius: 12px; background: var(--color-accent-soft); color: var(--color-accent); display: flex; align-items: center; justify-content: center;">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg>
              </div>
              <h3 style="font-size: 1.25rem; font-weight: 700; margin: 0;">${isRtl ? 'إدارة وتشغيل المزارع' : 'Farm Management'}</h3>
              <p style="font-size: 0.9rem; color: var(--color-text-muted); line-height: 1.6; margin: 0;">
                ${isRtl ? 'لأصحاب المزارع: اطلب إدارة متكاملة لمزرعتك وتلقَّ عروض تشغيل تفصيلية من نخبة المهندسين الزراعيين المرخصين.' : 'Request full-scale operational management or submit management proposals as a certified agricultural consultant.'}
              </p>
            </div>
            <a href="/${lang}/management" class="btn btn--secondary btn--sm" style="margin-top: 1rem;">
              ${isRtl ? 'سوق الإدارة' : 'Management Hub'} &rarr;
            </a>
          </div>

          <!-- Module 3: Partnerships & Investment -->
          <div class="card stack" style="justify-content: space-between; border-top: 4px solid #0369a1;">
            <div class="stack" style="gap: var(--space-3);">
              <div style="width: 50px; height: 50px; border-radius: 12px; background: #e0f2fe; color: #0369a1; display: flex; align-items: center; justify-content: center;">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>
              </div>
              <h3 style="font-size: 1.25rem; font-weight: 700; margin: 0;">${isRtl ? 'الشراكات والاستثمار' : 'Joint Ventures & Capital'}</h3>
              <p style="font-size: 0.9rem; color: var(--color-text-muted); line-height: 1.6; margin: 0;">
                ${isRtl ? 'فرص استثمارية مدروسة للدخول كشريك مالي أو شريك تشغيلي في مشاريع زراعية قائمة أو توسعات نخيل وإنتاج حيواني.' : 'Explore vetted agricultural investment deals, capital partnerships, and operating land-share agreements.'}
              </p>
            </div>
            <a href="/${lang}/partnerships" class="btn btn--secondary btn--sm" style="margin-top: 1rem;">
              ${isRtl ? 'فرص الشراكة' : 'Explore Partnerships'} &rarr;
            </a>
          </div>
        </div>

        <!-- Secondary modules: Quick Buy, Quick Sell, Suppliers, HR -->
        <div class="grid grid--cols-4" style="gap: var(--space-4); margin-top: 1rem;">
          <a href="/${lang}/quick-buy" class="card" style="text-decoration: none; border-inline-start: 4px solid var(--color-primary); padding: var(--space-4);">
            <strong style="color: var(--color-secondary); display: block; margin-bottom: 4px;">${isRtl ? 'شراء سريع مع أصول' : 'Quick Buy with Assets'}</strong>
            <span style="font-size: 0.85rem; color: var(--color-text-muted);">${isRtl ? 'حدد سيولتك وأصولك المقترحة للمبادلة' : 'Submit budget & trade existing assets'}</span>
          </a>

          <a href="/${lang}/quick-sell" class="card" style="text-decoration: none; border-inline-start: 4px solid var(--color-accent); padding: var(--space-4);">
            <strong style="color: var(--color-secondary); display: block; margin-bottom: 4px;">${isRtl ? 'بيع سريع بمساعدة الإدارة' : 'Quick Sell Assisted'}</strong>
            <span style="font-size: 0.85rem; color: var(--color-text-muted);">${isRtl ? 'تسهيلات بيع، تقسيط ومبادلة' : 'Assisted sale with installment options'}</span>
          </a>

          <a href="/${lang}/suppliers" class="card" style="text-decoration: none; border-inline-start: 4px solid #059669; padding: var(--space-4);">
            <strong style="color: var(--color-secondary); display: block; margin-bottom: 4px;">${isRtl ? 'دليل الموردين المعتمدين' : 'Suppliers Directory'}</strong>
            <span style="font-size: 0.85rem; color: var(--color-text-muted);">${isRtl ? 'شبكات ري، طاقة شمسية، ومعدات' : 'Irrigation, solar pumping & machinery'}</span>
          </a>

          <a href="/${lang}/human-resources" class="card" style="text-decoration: none; border-inline-start: 4px solid #7c3aed; padding: var(--space-4);">
            <strong style="color: var(--color-secondary); display: block; margin-bottom: 4px;">${isRtl ? 'الكوادر الزراعية' : 'Human Resources'}</strong>
            <span style="font-size: 0.85rem; color: var(--color-text-muted);">${isRtl ? 'مهندسون، مديرو مزارع، وبيطريون' : 'Agronomists, managers & specialists'}</span>
          </a>
        </div>
      </div>
    </section>

    <!-- Featured Farms Section -->
    <section style="background: var(--color-surface-alt); padding-block: var(--space-12); border-top: 1px solid var(--color-border);">
      <div class="container stack" style="gap: var(--space-8);">
        <div class="cluster" style="justify-content: space-between; align-items: flex-end;">
          <div>
            <span style="color: var(--color-accent); font-weight: 700; font-size: 0.85rem; text-transform: uppercase;">
              ${isRtl ? 'فرص مميزة وموثقة' : 'Verified Opportunities'}
            </span>
            <h2 style="font-size: 2rem; font-weight: 800; color: var(--color-secondary); margin: 4px 0 0;">
              ${isRtl ? 'أحدث المزارع المعروضة' : 'Featured Farm Listings'}
            </h2>
          </div>
          <a href="/${lang}/farms" class="btn btn--outline btn--sm">
            ${isRtl ? 'مشاهدة كافة المزارع' : 'View All Farms'} &rarr;
          </a>
        </div>

        <div class="grid grid--cols-3" style="gap: var(--space-6);">
          ${farms.slice(0, 6).map(f => {
            const purposeClass = f.purpose === 'sale' ? 'purpose--sale' : f.purpose === 'rent' ? 'purpose--rent' : 'purpose--both';
            const purposeLabel = f.purpose === 'sale' ? (isRtl ? 'للبيع' : 'For Sale') : f.purpose === 'rent' ? (isRtl ? 'للإيجار' : 'For Rent') : (isRtl ? 'بيع / إيجار' : 'Sale or Rent');
            const title = isRtl ? (f.title_ar || f.title_en) : f.title_en;
            const govName = isRtl ? (f.gov_name_ar || f.gov_name_en) : f.gov_name_en;
            const img = f.cover_image || 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80';

            return `
              <article class="farm-card">
                <div class="farm-card__image-wrap">
                  <img src="${escapeHtml(img)}" alt="${escapeHtml(title)}" class="farm-card__image" loading="lazy">
                  <span class="farm-card__badge-purpose ${purposeClass}">${purposeLabel}</span>
                  ${f.is_featured ? `<span style="position: absolute; top: 12px; inset-inline-end: 12px; background: #d97706; color: #fff; font-size: 0.72rem; font-weight: 700; padding: 4px 8px; border-radius: 4px;">★ ${isRtl ? 'مميزة' : 'Featured'}</span>` : ''}
                </div>

                <div class="stack" style="padding: var(--space-5); gap: var(--space-3); flex: 1; justify-content: space-between;">
                  <div class="stack" style="gap: var(--space-2);">
                    <div class="cluster" style="font-size: 0.85rem; color: var(--color-text-muted); gap: 6px;">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                      ${escapeHtml(govName)}
                    </div>

                    <h3 style="font-size: 1.15rem; font-weight: 700; line-height: 1.35; margin: 0;">
                      <a href="/${lang}/farms/${escapeHtml(f.slug)}" style="color: var(--color-text); text-decoration: none;">
                        ${escapeHtml(title)}
                      </a>
                    </h3>

                    <!-- Specs row -->
                    <div class="cluster" style="gap: 6px; margin-top: 4px;">
                      <span class="spec-pill">
                        <strong>${f.area_feddan}</strong> ${isRtl ? 'فدان' : 'Feddan'}
                      </span>
                      <span class="spec-pill">
                        ${f.water_source === 'nile' ? (isRtl ? 'نيل بحاري' : 'Nile Water') : (isRtl ? 'بئر ارتوازي' : 'Well Water')}
                      </span>
                      <span class="spec-pill">
                        ${f.electricity_source === 'solar' ? (isRtl ? 'طاقة شمسية' : 'Solar') : (isRtl ? 'كهرباء شبكة' : 'Grid Power')}
                      </span>
                    </div>
                  </div>

                  <div style="border-top: 1px solid var(--color-border); padding-top: var(--space-3); display: flex; justify-content: space-between; align-items: center;">
                    <div>
                      <div style="font-size: 0.75rem; color: var(--color-text-muted); font-weight: 600;">
                        ${f.purpose === 'rent' ? (isRtl ? 'القيمة الإيجارية السنوية' : 'Annual Rent') : (isRtl ? 'السعر الإجمالي' : 'Total Price')}
                      </div>
                      <div style="font-size: 1.2rem; font-weight: 800; color: var(--color-primary);">
                        ${formatEgp(f.price)} <span style="font-size: 0.8rem; font-weight: 600;">${isRtl ? 'جنيه' : 'EGP'}</span>
                      </div>
                    </div>
                    <a href="/${lang}/farms/${escapeHtml(f.slug)}" class="btn btn--sm btn--outline">
                      ${isRtl ? 'التفاصيل' : 'Details'} &rarr;
                    </a>
                  </div>
                </div>
              </article>
            `;
          }).join('')}
        </div>
      </div>
    </section>

    <!-- How It Works Section -->
    <section id="how-it-works" style="padding-block: var(--space-12);">
      <div class="container stack" style="gap: var(--space-8);">
        <div style="text-align: center; max-inline-size: 650px; margin-inline: auto;">
          <h2 style="font-size: 2rem; font-weight: 800; color: var(--color-secondary); margin-bottom: 0.5rem;">
            ${isRtl ? 'كيف تعمل منصة فارمين' : 'How FARMINN Operates'}
          </h2>
          <p style="color: var(--color-text-muted); margin: 0;">
            ${isRtl ? 'إجراءات احترافية تضمن سلامة الصفقات وتجنيب المستثمرين المخاطر الزراعية والقانونية.' : 'A transparent process ensuring legal compliance, agronomic verification, and successful contracts.'}
          </p>
        </div>

        <div class="grid grid--cols-3" style="gap: var(--space-6);">
          <div class="card stack" style="gap: var(--space-3); text-align: center; align-items: center;">
            <div style="width: 56px; height: 56px; border-radius: 50%; background: var(--color-primary-soft); color: var(--color-primary); display: flex; align-items: center; justify-content: center; font-size: 1.4rem; font-weight: 800;">
              1
            </div>
            <h3 style="font-size: 1.2rem; font-weight: 700; margin: 0;">${isRtl ? 'المعاينة والفحص الفني' : 'Technical & Legal Review'}</h3>
            <p style="font-size: 0.9rem; color: var(--color-text-muted); line-height: 1.6; margin: 0;">
              ${isRtl ? 'مراجعة أوراق الملكية المشهرة، تراخيص حفر الآبار، ملوحة المياه (PPM)، وتحاليل التربة قبل اعتماد ونشر أي مزرعة.' : 'Verification of notarized title deeds, water permits, well salinity tests, and soil reports prior to listing.'}
            </p>
          </div>

          <div class="card stack" style="gap: var(--space-3); text-align: center; align-items: center;">
            <div style="width: 56px; height: 56px; border-radius: 50%; background: var(--color-accent-soft); color: var(--color-accent); display: flex; align-items: center; justify-content: center; font-size: 1.4rem; font-weight: 800;">
              2
            </div>
            <h3 style="font-size: 1.2rem; font-weight: 700; margin: 0;">${isRtl ? 'الإدارة والتشغيل الاحترافي' : 'Turnkey Operations'}</h3>
            <p style="font-size: 0.9rem; color: var(--color-text-muted); line-height: 1.6; margin: 0;">
              ${isRtl ? 'توصيل المزارع بنخبة مديري المزارع والمهندسين الزراعيين لتقديم برامج تسميد وتشغيل ومكافحة بمعايير التصدير.' : 'Matching farm owners with verified agronomists to operate irrigation, fertilization, and export harvesting.'}
            </p>
          </div>

          <div class="card stack" style="gap: var(--space-3); text-align: center; align-items: center;">
            <div style="width: 56px; height: 56px; border-radius: 50%; background: #e0f2fe; color: #0369a1; display: flex; align-items: center; justify-content: center; font-size: 1.4rem; font-weight: 800;">
              3
            </div>
            <h3 style="font-size: 1.2rem; font-weight: 700; margin: 0;">${isRtl ? 'تكامل الموردين والشراكات' : 'Suppliers & Ecosystem'}</h3>
            <p style="font-size: 0.9rem; color: var(--color-text-muted); line-height: 1.6; margin: 0;">
              ${isRtl ? 'توفير التقاوي والشتلات المعتمدة ومحطات الطاقة الشمسية مع إمكانية مبادلة الأصول وإبرام شراكات استثمارية.' : 'Direct access to certified suppliers of solar pumps, drip networks, and seedlings with flexible deal structures.'}
            </p>
          </div>
        </div>
      </div>
    </section>
  `;
}

export function renderFarmsPage({ lang, farms = [], total = 0, locations = [], filters = {} }) {
  const isRtl = lang === 'ar';

  return `
    <div style="background: var(--color-surface-alt); border-bottom: 1px solid var(--color-border); padding-block: var(--space-8);">
      <div class="container">
        <h1 style="font-size: 2.2rem; font-weight: 800; color: var(--color-secondary); margin: 0 0 8px;">
          ${isRtl ? 'سوق المزارع والأراضي الزراعية' : 'Farms Marketplace'}
        </h1>
        <p style="color: var(--color-text-muted); margin: 0; font-size: 1.05rem;">
          ${isRtl ? 'مزارع وأراضٍ مفحوصة وموثقة للبيع والإيجار في كافة المحافظات' : 'Browse inspected and verified farms for sale and lease across Egypt'}
        </p>
      </div>
    </div>

    <div class="container" style="padding-block: var(--space-8);">
      <!-- Filter Bar -->
      <div class="card" style="margin-bottom: var(--space-6); padding: var(--space-4);">
        <form action="/${lang}/farms" method="GET" class="grid grid--cols-4" style="gap: var(--space-3); align-items: flex-end;">
          <div class="form-group" style="margin: 0;">
            <label class="form-label" style="font-weight: 600; font-size: 0.85rem;">${isRtl ? 'الغرض' : 'Listing Purpose'}</label>
            <select name="purpose" class="form-control" style="font-size: 0.9rem;">
              <option value="all" ${filters.purpose === 'all' ? 'selected' : ''}>${isRtl ? 'الكل (بيع وإيجار)' : 'All (Sale & Rent)'}</option>
              <option value="sale" ${filters.purpose === 'sale' ? 'selected' : ''}>${isRtl ? 'للبيع فقط' : 'For Sale'}</option>
              <option value="rent" ${filters.purpose === 'rent' ? 'selected' : ''}>${isRtl ? 'للإيجار فقط' : 'For Rent'}</option>
            </select>
          </div>

          <div class="form-group" style="margin: 0;">
            <label class="form-label" style="font-weight: 600; font-size: 0.85rem;">${isRtl ? 'المحافظة' : 'Governorate'}</label>
            <select name="gov" class="form-control" style="font-size: 0.9rem;">
              <option value="all">${isRtl ? 'كافة المحافظات' : 'All Governorates'}</option>
              ${locations.map(loc => `
                <option value="${escapeHtml(loc.slug)}" ${filters.gov === loc.slug ? 'selected' : ''}>
                  ${isRtl ? escapeHtml(loc.name_ar) : escapeHtml(loc.name_en)}
                </option>
              `).join('')}
            </select>
          </div>

          <div class="form-group" style="margin: 0;">
            <label class="form-label" style="font-weight: 600; font-size: 0.85rem;">${isRtl ? 'أقل مساحة (فدان)' : 'Min Area (Feddan)'}</label>
            <input type="number" name="minArea" value="${escapeHtml(filters.minArea || '')}" class="form-control" placeholder="0" style="font-size: 0.9rem;">
          </div>

          <div class="cluster" style="gap: 8px;">
            <button type="submit" class="btn btn--primary" style="flex: 1; height: 42px;">
              ${isRtl ? 'تطبيق الفلتر' : 'Filter'}
            </button>
            <a href="/${lang}/farms" class="btn btn--ghost" style="height: 42px;">
              ${isRtl ? 'إعادة ضبط' : 'Reset'}
            </a>
          </div>
        </form>
      </div>

      <!-- Result header -->
      <div class="cluster" style="justify-content: space-between; margin-bottom: var(--space-6);">
        <span style="font-weight: 600; color: var(--color-text-secondary);">
          ${isRtl ? `تم العثور على ${farms.length} مزرعة` : `Found ${farms.length} farms`}
        </span>
      </div>

      <!-- Farms Grid -->
      ${farms.length === 0 ? `
        <div class="card stack" style="text-align: center; padding: var(--space-12); align-items: center;">
          <p style="font-size: 1.1rem; color: var(--color-text-muted); margin: 0;">
            ${isRtl ? 'لم يتم العثور على مزارع مطابقة لخيارات البحث المحددة.' : 'No farms matched your search criteria.'}
          </p>
          <a href="/${lang}/farms" class="btn btn--primary btn--sm" style="margin-top: 1rem;">
            ${isRtl ? 'عرض كافة المزارع' : 'Show All Farms'}
          </a>
        </div>
      ` : `
        <div class="grid grid--cols-3" style="gap: var(--space-6);">
          ${farms.map(f => {
            const purposeClass = f.purpose === 'sale' ? 'purpose--sale' : f.purpose === 'rent' ? 'purpose--rent' : 'purpose--both';
            const purposeLabel = f.purpose === 'sale' ? (isRtl ? 'للبيع' : 'For Sale') : f.purpose === 'rent' ? (isRtl ? 'للإيجار' : 'For Rent') : (isRtl ? 'بيع / إيجار' : 'Sale / Rent');
            const title = isRtl ? (f.title_ar || f.title_en) : f.title_en;
            const govName = isRtl ? (f.gov_name_ar || f.gov_name_en) : f.gov_name_en;
            const img = f.cover_image || 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80';

            return `
              <article class="farm-card">
                <div class="farm-card__image-wrap">
                  <img src="${escapeHtml(img)}" alt="${escapeHtml(title)}" class="farm-card__image" loading="lazy">
                  <span class="farm-card__badge-purpose ${purposeClass}">${purposeLabel}</span>
                  ${f.is_featured ? `<span style="position: absolute; top: 12px; inset-inline-end: 12px; background: #d97706; color: #fff; font-size: 0.72rem; font-weight: 700; padding: 4px 8px; border-radius: 4px;">★ ${isRtl ? 'مميزة' : 'Featured'}</span>` : ''}
                </div>

                <div class="stack" style="padding: var(--space-5); gap: var(--space-3); flex: 1; justify-content: space-between;">
                  <div class="stack" style="gap: var(--space-2);">
                    <div class="cluster" style="font-size: 0.85rem; color: var(--color-text-muted); gap: 6px;">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                      ${escapeHtml(govName)}
                    </div>

                    <h2 style="font-size: 1.15rem; font-weight: 700; line-height: 1.35; margin: 0;">
                      <a href="/${lang}/farms/${escapeHtml(f.slug)}" style="color: var(--color-text); text-decoration: none;">
                        ${escapeHtml(title)}
                      </a>
                    </h2>

                    <div class="cluster" style="gap: 6px; margin-top: 4px;">
                      <span class="spec-pill"><strong>${f.area_feddan}</strong> ${isRtl ? 'فدان' : 'Feddan'}</span>
                      <span class="spec-pill">${f.water_source === 'nile' ? (isRtl ? 'نيل بحاري' : 'Nile Water') : (isRtl ? 'بئر ارتوازي' : 'Well')}</span>
                      <span class="spec-pill">${f.electricity_source === 'solar' ? (isRtl ? 'طاقة شمسية' : 'Solar') : (isRtl ? 'كهرباء شبكة' : 'Grid')}</span>
                    </div>
                  </div>

                  <div style="border-top: 1px solid var(--color-border); padding-top: var(--space-3); display: flex; justify-content: space-between; align-items: center;">
                    <div>
                      <div style="font-size: 0.75rem; color: var(--color-text-muted); font-weight: 600;">
                        ${f.purpose === 'rent' ? (isRtl ? 'القيمة الإيجارية' : 'Rent') : (isRtl ? 'السعر' : 'Price')}
                      </div>
                      <div style="font-size: 1.2rem; font-weight: 800; color: var(--color-primary);">
                        ${formatEgp(f.price)} <span style="font-size: 0.8rem; font-weight: 600;">${isRtl ? 'جنيه' : 'EGP'}</span>
                      </div>
                    </div>
                    <a href="/${lang}/farms/${escapeHtml(f.slug)}" class="btn btn--sm btn--outline">
                      ${isRtl ? 'التفاصيل' : 'Details'} &rarr;
                    </a>
                  </div>
                </div>
              </article>
            `;
          }).join('')}
        </div>
      `}
    </div>
  `;
}

export function renderFarmDetailPage({ lang, farm, media = [], documents = [] }) {
  const isRtl = lang === 'ar';
  const title = isRtl ? (farm.title_ar || farm.title_en) : farm.title_en;
  const description = isRtl ? (farm.description_ar || farm.description_en) : farm.description_en;
  const govName = isRtl ? (farm.gov_name_ar || farm.gov_name_en) : farm.gov_name_en;
  const cleanWhatsapp = (farm.contact_whatsapp || '201004491026').replace(/[^0-9]/g, '');

  const facilities = Array.isArray(farm.facilities) ? farm.facilities : [];
  const crops = Array.isArray(farm.crops) ? farm.crops : [];

  return `
    <div style="background: var(--color-surface-alt); border-bottom: 1px solid var(--color-border); padding-block: var(--space-6);">
      <div class="container cluster" style="gap: 8px; font-size: 0.88rem; color: var(--color-text-muted);">
        <a href="/${lang}" style="color: var(--color-text-muted);">${isRtl ? 'الرئيسية' : 'Home'}</a>
        <span>/</span>
        <a href="/${lang}/farms" style="color: var(--color-text-muted);">${isRtl ? 'المزارع' : 'Farms'}</a>
        <span>/</span>
        <span style="color: var(--color-text); font-weight: 600;">${escapeHtml(govName)}</span>
      </div>
    </div>

    <div class="container stack" style="padding-block: var(--space-8); gap: var(--space-8);">
      <!-- Title & Price Header -->
      <div class="cluster" style="justify-content: space-between; align-items: flex-start; gap: var(--space-4);">
        <div style="max-inline-size: 750px;">
          <div class="cluster" style="gap: 8px; margin-bottom: 8px;">
            <span class="badge ${farm.purpose === 'sale' ? 'badge--info' : 'badge--warning'}">
              ${farm.purpose === 'sale' ? (isRtl ? 'معروض للبيع' : 'For Sale') : (isRtl ? 'معروض للإيجار' : 'For Rent')}
            </span>
            <span class="badge badge--success">${isRtl ? 'معاينة ومفحوصة الأوراق' : 'Verified Listing'}</span>
          </div>
          <h1 style="font-size: clamp(1.8rem, 1.5rem + 1vw, 2.5rem); font-weight: 800; color: var(--color-secondary); margin: 0 0 8px;">
            ${escapeHtml(title)}
          </h1>
          <p style="color: var(--color-text-muted); margin: 0; font-size: 1rem;">
            ${escapeHtml(govName)} · ${escapeHtml(farm.city_en || '')}
          </p>
        </div>

        <div style="text-align: ${isRtl ? 'left' : 'right'};">
          <div style="font-size: 0.85rem; color: var(--color-text-muted); font-weight: 600;">
            ${farm.purpose === 'rent' ? (isRtl ? 'القيمة الإيجارية السنوية' : 'Annual Rent') : (isRtl ? 'السعر المطلوب' : 'Asking Price')}
          </div>
          <div style="font-size: 2.2rem; font-weight: 800; color: var(--color-primary); line-height: 1.1;">
            ${formatEgp(farm.price)} <span style="font-size: 1rem; font-weight: 600;">${isRtl ? 'جنيه' : 'EGP'}</span>
          </div>
          ${farm.price_per_feddan > 0 ? `
            <div style="font-size: 0.85rem; color: var(--color-text-muted); margin-top: 4px;">
              ${formatEgp(farm.price_per_feddan)} ${isRtl ? 'جنيه / فدان' : 'EGP / Feddan'}
            </div>
          ` : ''}
        </div>
      </div>

      <!-- Photo Gallery Grid -->
      <div class="grid grid--cols-3" style="gap: var(--space-3); border-radius: var(--radius-lg); overflow: hidden;">
        ${media.length > 0 ? media.map((m, idx) => `
          <div style="aspect-ratio: 16 / 10; background: #e7ece7; overflow: hidden; ${idx === 0 ? 'grid-column: span 2; grid-row: span 2;' : ''}">
            <img src="${escapeHtml(m.image_url)}" alt="${escapeHtml(title)}" style="width: 100%; height: 100%; object-fit: cover;">
          </div>
        `).join('') : `
          <div style="aspect-ratio: 16 / 10; background: #e7ece7; grid-column: span 3;">
            <img src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80" style="width: 100%; height: 100%; object-fit: cover;">
          </div>
        `}
      </div>

      <!-- Main Columns: Details vs Inquiry Form -->
      <div class="grid" style="grid-template-columns: 2fr 1fr; gap: var(--space-8); align-items: flex-start;">
        <div class="stack" style="gap: var(--space-8);">
          <!-- Key Overview Specs -->
          <div class="card grid grid--cols-3" style="text-align: center; gap: var(--space-4); background: #ffffff;">
            <div>
              <div style="font-size: 0.85rem; color: var(--color-text-muted);">${isRtl ? 'المساحة الكلية' : 'Total Area'}</div>
              <div style="font-size: 1.5rem; font-weight: 800; color: var(--color-secondary); margin-top: 4px;">
                ${farm.area_feddan} <span style="font-size: 0.9rem;">${isRtl ? 'فدان' : 'Feddan'}</span>
              </div>
            </div>
            <div>
              <div style="font-size: 0.85rem; color: var(--color-text-muted);">${isRtl ? 'مصدر المياه' : 'Water Source'}</div>
              <div style="font-size: 1.15rem; font-weight: 700; color: var(--color-secondary); margin-top: 4px;">
                ${farm.water_source === 'nile' ? (isRtl ? 'نيل بحاري' : 'Nile Canal') : (isRtl ? 'بئر ارتوازي' : 'Deep Well')}
              </div>
            </div>
            <div>
              <div style="font-size: 0.85rem; color: var(--color-text-muted);">${isRtl ? 'مصدر الكهرباء' : 'Power Source'}</div>
              <div style="font-size: 1.15rem; font-weight: 700; color: var(--color-secondary); margin-top: 4px;">
                ${farm.electricity_source === 'solar' ? (isRtl ? 'طاقة شمسية' : 'Solar Power') : (isRtl ? 'كهرباء شبكة' : 'Grid Power')}
              </div>
            </div>
          </div>

          <!-- Description -->
          <div class="stack" style="gap: var(--space-3);">
            <h2 style="font-size: 1.4rem; font-weight: 800; color: var(--color-secondary); margin: 0;">
              ${isRtl ? 'عن المزرعة والموقع' : 'About This Property'}
            </h2>
            <div style="line-height: 1.7; color: var(--color-text-secondary); white-space: pre-line; font-size: 1.05rem;">
              ${escapeHtml(description)}
            </div>
          </div>

          <!-- Technical Specs Table -->
          <div class="stack" style="gap: var(--space-3);">
            <h2 style="font-size: 1.4rem; font-weight: 800; color: var(--color-secondary); margin: 0;">
              ${isRtl ? 'المواصفات الفنية والقانونية' : 'Technical & Legal Specifications'}
            </h2>
            <table class="table" style="background: #ffffff; border-radius: var(--radius-md); overflow: hidden;">
              <tbody>
                <tr>
                  <th style="inline-size: 35%;">${isRtl ? 'الوضع القانوني والعقود' : 'Legal Deed Status'}</th>
                  <td><span class="badge badge--success">${isRtl ? 'عقد مسجل وخالص الملكية' : 'Registered Title Deed'}</span></td>
                </tr>
                <tr>
                  <th>${isRtl ? 'المياه وتفاصيل الري' : 'Water & Salinity'}</th>
                  <td>${escapeHtml(isRtl ? (farm.water_details_ar || farm.water_details_en || 'بئر ارتوازي') : (farm.water_details_en || 'Deep well'))}</td>
                </tr>
                <tr>
                  <th>${isRtl ? 'شبكة ونظام الري' : 'Irrigation System'}</th>
                  <td>${farm.irrigation_system === 'pivot' ? (isRtl ? 'ري محوري (بيفوت)' : 'Center Pivot') : (isRtl ? 'ري بالتنقيط الحديث' : 'Modern Drip Network')}</td>
                </tr>
                <tr>
                  <th>${isRtl ? 'طبيعة ونوع التربة' : 'Soil Quality'}</th>
                  <td>${farm.soil_type === 'sandy_loam' ? (isRtl ? 'رملية طميية خصبة' : 'Fertile Sandy Loam') : (isRtl ? 'رملية مستصلحة' : 'Reclaimed Sandy')}</td>
                </tr>
                <tr>
                  <th>${isRtl ? 'المحاصيل القائمة' : 'Current Crops'}</th>
                  <td>${crops.join(' • ') || (isRtl ? 'أشجار منتجة' : 'Productive trees')}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Verified Documents -->
          <div class="stack" style="gap: var(--space-3);">
            <h2 style="font-size: 1.4rem; font-weight: 800; color: var(--color-secondary); margin: 0;">
              ${isRtl ? 'المستندات والأوراق الرسمية المفحوصة' : 'Verified Documents'}
            </h2>
            <div class="stack" style="gap: var(--space-2);">
              ${documents.map(d => `
                <div class="card cluster" style="justify-content: space-between; padding: var(--space-3) var(--space-4);">
                  <div class="cluster" style="gap: 10px;">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="#1b4332"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>
                    <div>
                      <strong style="display: block; font-size: 0.95rem;">${escapeHtml(isRtl ? d.title_ar : d.title_en)}</strong>
                      <span style="font-size: 0.8rem; color: #15803d;">✔ ${isRtl ? 'تمت مطابقة الأصل مع السجلات الرسمية' : 'Verified against official land registries'}</span>
                    </div>
                  </div>
                  <span class="badge badge--success">${isRtl ? 'موثق' : 'Verified'}</span>
                </div>
              `).join('')}
            </div>
          </div>
        </div>

        <!-- Right Sticky Action Box -->
        <div class="stack" style="gap: var(--space-4); position: sticky; top: calc(var(--header-height) + 20px);">
          <!-- Quick Contact Card -->
          <div class="card stack" style="padding: var(--space-5); gap: var(--space-4); background: #ffffff;">
            <h3 style="font-size: 1.2rem; font-weight: 800; margin: 0;">
              ${isRtl ? 'طلب معاينة أو تفاوض' : 'Schedule Viewing & Inquiry'}
            </h3>
            
            <a href="https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent(`مرحباً، أستفسر بخصوص مزرعة ${farm.slug}`)}" target="_blank" rel="noopener" class="whatsapp-btn btn" style="width: 100%; height: 46px; border-radius: 8px;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0012.04 2z"/></svg>
              ${isRtl ? 'تواصل عبر واتساب فوراً' : 'WhatsApp Directly'}
            </a>

            <div style="text-align: center; font-size: 0.85rem; color: var(--color-text-muted); font-weight: 600;">
              ${isRtl ? 'أو سجل بياناتك وسنتصل بك:' : 'Or leave your details to call you back:'}
            </div>

            <!-- Inquiry Form -->
            <form id="farm-inquiry-form" class="stack" style="gap: var(--space-3);">
              <div class="form-group" style="margin: 0;">
                <label class="form-label" style="font-size: 0.82rem;">${isRtl ? 'الاسم بالكامل' : 'Full Name'}</label>
                <input type="text" name="name" required class="form-control" placeholder="${isRtl ? 'أحمد منصور' : 'Your name'}">
              </div>

              <div class="form-group" style="margin: 0;">
                <label class="form-label" style="font-size: 0.82rem;">${isRtl ? 'رقم الهاتف / الواتساب' : 'Mobile Number'}</label>
                <input type="tel" name="phone" required class="form-control" placeholder="+20 100 000 0000">
              </div>

              <div class="form-group" style="margin: 0;">
                <label class="form-label" style="font-size: 0.82rem;">${isRtl ? 'رسالتك أو موعد المعاينة المقترح' : 'Message / Preferred Viewing Date'}</label>
                <textarea name="message" rows="3" class="form-control" placeholder="${isRtl ? 'أرغب في تحديد موعد لمعاينة المزرعة...' : 'I would like to arrange an inspection...'}"></textarea>
              </div>

              <button type="submit" class="btn btn--primary" style="width: 100%; height: 42px;">
                ${isRtl ? 'إرسال طلب المعاينة' : 'Submit Inquiry'}
              </button>
            </form>
            <div id="inquiry-status" style="font-size: 0.85rem; text-align: center; display: none;"></div>
          </div>
        </div>
      </div>
    </div>

    <script>
      document.getElementById('farm-inquiry-form')?.addEventListener('submit', async function(e) {
        e.preventDefault();
        const statusBox = document.getElementById('inquiry-status');
        const formData = new FormData(this);
        const data = Object.fromEntries(formData.entries());
        statusBox.style.display = 'block';
        statusBox.innerHTML = '${isRtl ? 'جارٍ الإرسال...' : 'Submitting...'}';

        try {
          const res = await fetch('/api/farms/${farm.slug}/inquire', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
          });
          const resData = await res.json();
          if (res.ok) {
            statusBox.style.color = 'var(--color-success)';
            statusBox.innerHTML = '✔ ' + (resData.message || '${isRtl ? 'تم إرسال الطلب بنجاح' : 'Inquiry sent successfully'}');
            this.reset();
          } else {
            statusBox.style.color = 'var(--color-danger)';
            statusBox.innerHTML = '✖ ' + (resData.error || 'Error submitting');
          }
        } catch (err) {
          statusBox.style.color = 'var(--color-danger)';
          statusBox.innerHTML = '✖ ' + err.message;
        }
      });
    </script>
  `;
}

export function renderManagementPage({ lang, requests = [], locations = [] }) {
  const isRtl = lang === 'ar';

  return `
    <div style="background: linear-gradient(135deg, #1b4332 0%, #2d6a4f 100%); color: #ffffff; padding-block: var(--space-10);">
      <div class="container cluster" style="justify-content: space-between; align-items: center;">
        <div style="max-inline-size: 700px;">
          <h1 style="font-size: 2.4rem; font-weight: 800; color: #ffffff; margin: 0 0 8px;">
            ${isRtl ? 'سوق إدارة وتشغيل المزارع' : 'Farm Management Marketplace'}
          </h1>
          <p style="color: #d4ebd4; margin: 0; font-size: 1.1rem; line-height: 1.6;">
            ${isRtl ? 'اربط مزرعتك بنخبة من مديري المزارع والمهندسين الزراعيين المحترفين، أو تصفح طلبات الإدارة وقدم عروضك التشغيلية.' : 'Connect your farm with certified agricultural managers, or browse open management requests and submit competitive operational proposals.'}
          </p>
        </div>
        <button type="button" class="btn btn--primary" id="open-mgmt-req-btn" style="background: var(--color-accent); border-color: var(--color-accent); height: 48px; font-weight: 700;">
          + ${isRtl ? 'طلب إدارة مزرعة جديدة' : 'Request Farm Management'}
        </button>
      </div>
    </div>

    <div class="container stack" style="padding-block: var(--space-8); gap: var(--space-6);">
      <h2 style="font-size: 1.5rem; font-weight: 800; color: var(--color-secondary); margin: 0;">
        ${isRtl ? 'طلبات الإدارة المفتوحة حالياً' : 'Open Management Requests'}
      </h2>

      <div class="stack" style="gap: var(--space-4);">
        ${requests.map(r => `
          <div class="card stack" style="padding: var(--space-5); gap: var(--space-3); background: #ffffff;">
            <div class="cluster" style="justify-content: space-between; align-items: flex-start;">
              <div>
                <span class="badge badge--success" style="margin-bottom: 6px;">${isRtl ? 'طلب مفتوح' : 'Open for Proposals'}</span>
                <h3 style="font-size: 1.25rem; font-weight: 700; margin: 0;">
                  ${escapeHtml(isRtl ? r.title_ar : r.title_en)}
                </h3>
                <div class="cluster" style="font-size: 0.88rem; color: var(--color-text-muted); margin-top: 4px; gap: 8px;">
                  <span>📍 ${escapeHtml(isRtl ? (r.gov_name_ar || r.gov_name_en) : r.gov_name_en)}</span>
                  <span>•</span>
                  <span>🌾 ${r.area_feddan} ${isRtl ? 'فدان' : 'Feddan'}</span>
                  <span>•</span>
                  <span>🍊 ${escapeHtml(r.crops_activity || '')}</span>
                </div>
              </div>

              <div style="text-align: ${isRtl ? 'left' : 'right'};">
                <span class="badge badge--info">${r.proposals_count} ${isRtl ? 'عروض مقدمة' : 'proposals'}</span>
                <div style="font-size: 0.85rem; color: var(--color-text-muted); margin-top: 4px;">
                  ${escapeHtml(r.budget_range || '')}
                </div>
              </div>
            </div>

            <p style="color: var(--color-text-secondary); line-height: 1.6; margin: 0; font-size: 0.95rem;">
              ${escapeHtml(r.details || '')}
            </p>

            <div style="border-top: 1px solid var(--color-border); padding-top: var(--space-3); display: flex; justify-content: space-between; align-items: center;">
              <span style="font-size: 0.85rem; color: var(--color-text-muted);">
                ${isRtl ? 'المعلن:' : 'Owner:'} ${escapeHtml(r.contact_name)}
              </span>
              <button type="button" class="btn btn--sm btn--primary submit-proposal-btn" data-req-id="${r.id}" data-req-title="${escapeHtml(isRtl ? r.title_ar : r.title_en)}">
                ${isRtl ? 'تقديم عرض إدارة' : 'Submit Proposal'}
              </button>
            </div>
          </div>
        `).join('')}
      </div>
    </div>

    <!-- Management Request Modal -->
    <div id="mgmt-modal" class="modal-backdrop" hidden>
      <div class="modal" style="max-inline-size: 600px;">
        <div class="modal__header cluster" style="justify-content: space-between;">
          <h3 style="margin: 0; font-size: 1.25rem; font-weight: 800;">${isRtl ? 'طلب إدارة وتشغيل مزرعة' : 'Request Farm Management'}</h3>
          <button type="button" class="btn btn--ghost btn--sm" id="close-mgmt-modal">&times;</button>
        </div>
        <form id="mgmt-req-form" class="stack" style="gap: var(--space-3); padding: var(--space-4);">
          <div class="form-group" style="margin: 0;">
            <label class="form-label">${isRtl ? 'عنوان الطلب' : 'Request Title'}</label>
            <input type="text" name="title" required class="form-control" placeholder="${isRtl ? 'إدارة وتشغيل مزرعة 50 فدان...' : 'Full farm operations for 50 feddan...'}">
          </div>
          <div class="grid grid--cols-2" style="gap: var(--space-3);">
            <div class="form-group" style="margin: 0;">
              <label class="form-label">${isRtl ? 'المحافظة' : 'Governorate'}</label>
              <select name="governorateId" class="form-control">
                ${locations.map(loc => `<option value="${loc.id}">${isRtl ? loc.name_ar : loc.name_en}</option>`).join('')}
              </select>
            </div>
            <div class="form-group" style="margin: 0;">
              <label class="form-label">${isRtl ? 'المساحة (فدان)' : 'Area (Feddan)'}</label>
              <input type="number" name="areaFeddan" required class="form-control" placeholder="50">
            </div>
          </div>
          <div class="form-group" style="margin: 0;">
            <label class="form-label">${isRtl ? 'المحاصيل القائمة أو المستهدفة' : 'Crops / Target Activity'}</label>
            <input type="text" name="crops" class="form-control" placeholder="${isRtl ? 'موالح، نخيل مجدول، خضروات' : 'Citrus, Palms, Vegetables'}">
          </div>
          <div class="form-group" style="margin: 0;">
            <label class="form-label">${isRtl ? 'المقابل المالي المقترح / الميزانية' : 'Budget / Compensation'}</label>
            <input type="text" name="budget" class="form-control" placeholder="${isRtl ? 'مثال: 30,000 جنيه شهرياً + نسبة أرباح' : 'e.g. 30,000 EGP / month'}">
          </div>
          <div class="form-group" style="margin: 0;">
            <label class="form-label">${isRtl ? 'تفاصيل الطلب' : 'Project Details'}</label>
            <textarea name="details" rows="3" class="form-control"></textarea>
          </div>
          <div class="grid grid--cols-2" style="gap: var(--space-3);">
            <div class="form-group" style="margin: 0;">
              <label class="form-label">${isRtl ? 'اسم المالك / المسؤول' : 'Contact Name'}</label>
              <input type="text" name="contactName" required class="form-control">
            </div>
            <div class="form-group" style="margin: 0;">
              <label class="form-label">${isRtl ? 'رقم الهاتف / الواتساب' : 'Phone Number'}</label>
              <input type="tel" name="contactPhone" required class="form-control">
            </div>
          </div>
          <button type="submit" class="btn btn--primary" style="height: 44px; margin-top: 8px;">
            ${isRtl ? 'نشر طلب الإدارة' : 'Publish Request'}
          </button>
        </form>
      </div>
    </div>

    <script>
      const modal = document.getElementById('mgmt-modal');
      document.getElementById('open-mgmt-req-btn')?.addEventListener('click', () => modal.hidden = false);
      document.getElementById('close-mgmt-modal')?.addEventListener('click', () => modal.hidden = true);
      
      document.getElementById('mgmt-req-form')?.addEventListener('submit', async function(e) {
        e.preventDefault();
        const data = Object.fromEntries(new FormData(this).entries());
        try {
          const res = await fetch('/api/management', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
          });
          if (res.ok) {
            alert('${isRtl ? 'تم نشر طلب الإدارة بنجاح' : 'Management request published'}');
            window.location.reload();
          } else {
            const err = await res.json();
            alert(err.error || 'Failed to submit');
          }
        } catch (e) {
          alert(e.message);
        }
      });
    </script>
  `;
}

export function renderPartnershipsPage({ lang, partnerships = [], locations = [] }) {
  const isRtl = lang === 'ar';

  return `
    <div style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); color: #ffffff; padding-block: var(--space-10);">
      <div class="container cluster" style="justify-content: space-between; align-items: center;">
        <div style="max-inline-size: 700px;">
          <h1 style="font-size: 2.4rem; font-weight: 800; color: #ffffff; margin: 0 0 8px;">
            ${isRtl ? 'سوق الشراكات والاستثمار الزراعي' : 'Agricultural Partnerships & Investment'}
          </h1>
          <p style="color: #94a3b8; margin: 0; font-size: 1.1rem; line-height: 1.6;">
            ${isRtl ? 'فرص استثمارية موثقة للشراكة مع ملاك أراضٍ أو مستثمرين ماليين وتشغيليين في مشاريع زراعية وإنتاج حيواني.' : 'Explore verified agricultural joint ventures, capital investor requests, and operating land partnerships.'}
          </p>
        </div>
      </div>
    </div>

    <div class="container stack" style="padding-block: var(--space-8); gap: var(--space-6);">
      <div class="grid grid--cols-2" style="gap: var(--space-6);">
        ${partnerships.map(p => `
          <div class="card stack" style="padding: var(--space-6); gap: var(--space-4); background: #ffffff; border-top: 4px solid var(--color-accent);">
            <div class="cluster" style="justify-content: space-between;">
              <span class="badge badge--warning">
                ${p.partnership_type === 'capital_investor' ? (isRtl ? 'مطلوب شريك ممول' : 'Capital Investor Needed') : (isRtl ? 'مطلوب شريك تشغيلي' : 'Operating Partner')}
              </span>
              <span style="font-size: 0.85rem; color: var(--color-text-muted);">
                📍 ${escapeHtml(isRtl ? (p.gov_name_ar || p.gov_name_en) : p.gov_name_en)}
              </span>
            </div>

            <h3 style="font-size: 1.35rem; font-weight: 700; color: var(--color-secondary); margin: 0;">
              ${escapeHtml(isRtl ? p.title_ar : p.title_en)}
            </h3>

            <div class="grid grid--cols-2" style="background: var(--color-surface-alt); padding: var(--space-3); border-radius: 8px;">
              <div>
                <div style="font-size: 0.8rem; color: var(--color-text-muted);">${isRtl ? 'رأس المال المطلوب' : 'Required Capital'}</div>
                <div style="font-size: 1.25rem; font-weight: 800; color: var(--color-primary);">${formatEgp(p.required_capital)} EGP</div>
              </div>
              <div>
                <div style="font-size: 0.8rem; color: var(--color-text-muted);">${isRtl ? 'الحصة المعروضة' : 'Offered Equity'}</div>
                <div style="font-size: 1.25rem; font-weight: 800; color: var(--color-accent);">${p.equity_share_percent}%</div>
              </div>
            </div>

            <p style="color: var(--color-text-secondary); line-height: 1.6; margin: 0; font-size: 0.95rem;">
              ${escapeHtml(isRtl ? p.objectives_ar : p.objectives_en)}
            </p>

            <div style="border-top: 1px solid var(--color-border); padding-top: var(--space-4); display: flex; justify-content: space-between; align-items: center;">
              <span style="font-size: 0.85rem; color: var(--color-text-muted);">
                ${isRtl ? 'المسؤول:' : 'Contact:'} ${escapeHtml(p.contact_name)} (${p.contact_phone})
              </span>
              <a href="https://wa.me/${p.contact_whatsapp.replace(/[^0-9]/g, '')}" target="_blank" class="whatsapp-btn btn btn--sm" style="border-radius: 6px;">
                ${isRtl ? 'تواصل للشراكة' : 'Discuss Partnership'}
              </a>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

export function renderQuickBuyPage({ lang, locations = [] }) {
  const isRtl = lang === 'ar';

  return `
    <div class="container" style="padding-block: var(--space-10); max-inline-size: 750px;">
      <div class="card stack" style="padding: var(--space-8); gap: var(--space-5); background: #ffffff;">
        <div>
          <span class="badge badge--info">${isRtl ? 'خدمة للمشترين والمستثمرين' : 'For Qualified Buyers'}</span>
          <h1 style="font-size: 2rem; font-weight: 800; color: var(--color-secondary); margin: 8px 0 4px;">
            ${isRtl ? 'شراء سريع مع أصول ومبادلة' : 'Quick Buy with Assets'}
          </h1>
          <p style="color: var(--color-text-muted); margin: 0; line-height: 1.6;">
            ${isRtl ? 'سجل مواصفات المزرعة التي تبحث عنها وميزانيتك النقدية، مع إمكانية مبادلة أصول عقارية أو سيارات أو معدات ثقيلة.' : 'Submit your target farm criteria and cash budget. Optionally trade in real estate, vehicles, or equipment.'}
          </p>
        </div>

        <form id="quick-buy-form" class="stack" style="gap: var(--space-4);">
          <div class="grid grid--cols-2" style="gap: var(--space-4);">
            <div class="form-group" style="margin: 0;">
              <label class="form-label">${isRtl ? 'الاسم بالكامل' : 'Full Name'}</label>
              <input type="text" name="fullName" required class="form-control" placeholder="${isRtl ? 'محمد عبد الله' : 'Full Name'}">
            </div>
            <div class="form-group" style="margin: 0;">
              <label class="form-label">${isRtl ? 'رقم الهاتف / الواتساب' : 'Mobile Number'}</label>
              <input type="tel" name="mobile" required class="form-control" placeholder="+20 100 000 0000">
            </div>
          </div>

          <div class="form-group" style="margin: 0;">
            <label class="form-label">${isRtl ? 'السيولة النقدية المتاحة (جنيه)' : 'Available Cash Budget (EGP)'}</label>
            <input type="number" name="cashAmount" required class="form-control" placeholder="10000000">
          </div>

          <div class="grid grid--cols-2" style="gap: var(--space-4);">
            <div class="form-group" style="margin: 0;">
              <label class="form-label">${isRtl ? 'المحافظة المفضلة' : 'Preferred Governorate'}</label>
              <select name="governorateId" class="form-control">
                <option value="">${isRtl ? 'أي محافظة مناسبة' : 'Any Suitable Location'}</option>
                ${locations.map(loc => `<option value="${loc.id}">${isRtl ? loc.name_ar : loc.name_en}</option>`).join('')}
              </select>
            </div>
            <div class="form-group" style="margin: 0;">
              <label class="form-label">${isRtl ? 'المساحة المطلوبة (فدان تقريباً)' : 'Target Area (Feddans approx)'}</label>
              <input type="number" name="minArea" class="form-control" placeholder="25">
            </div>
          </div>

          <div style="border-top: 1px solid var(--color-border); padding-top: var(--space-4);">
            <label class="form-label" style="font-weight: 700; color: var(--color-secondary);">
              ${isRtl ? 'هل لديك أصول ترغب في مبادلتها؟ (اختياري)' : 'Do you have assets to trade? (Optional)'}
            </label>
            <div class="grid grid--cols-2" style="gap: var(--space-4); margin-top: 6px;">
              <select name="exchangeAssetType" class="form-control">
                <option value="none">${isRtl ? 'لا يوجد (شراء كاش فقط)' : 'None (Cash Only)'}</option>
                <option value="real_estate">${isRtl ? 'عقارات / شقق / أراضي' : 'Real Estate / Apartment'}</option>
                <option value="vehicle">${isRtl ? 'سيارات فاخرة' : 'Vehicles / Cars'}</option>
                <option value="machinery">${isRtl ? 'معدات وآلات ثقيلة' : 'Heavy Equipment'}</option>
              </select>
              <input type="text" name="exchangeAssetDescription" class="form-control" placeholder="${isRtl ? 'تفاصيل الأصل وقيمته التقديرية' : 'Asset details & approx value'}">
            </div>
          </div>

          <button type="submit" class="btn btn--primary" style="height: 48px; font-weight: 700; font-size: 1rem; margin-top: 8px;">
            ${isRtl ? 'إرسال طلب الشراء السريع' : 'Submit Quick Buy Request'}
          </button>
        </form>
      </div>
    </div>

    <script>
      document.getElementById('quick-buy-form')?.addEventListener('submit', async function(e) {
        e.preventDefault();
        const data = Object.fromEntries(new FormData(this).entries());
        try {
          const res = await fetch('/api/quick-buy', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
          });
          const resData = await res.json();
          if (res.ok) {
            alert(resData.message || 'Submitted successfully');
            this.reset();
          } else {
            alert(resData.error || 'Error submitting');
          }
        } catch (e) {
          alert(e.message);
        }
      });
    </script>
  `;
}

export function renderQuickSellPage({ lang, locations = [] }) {
  const isRtl = lang === 'ar';

  return `
    <div class="container" style="padding-block: var(--space-10); max-inline-size: 750px;">
      <div class="card stack" style="padding: var(--space-8); gap: var(--space-5); background: #ffffff;">
        <div>
          <span class="badge badge--warning">${isRtl ? 'خدمة لملاك المزارع' : 'For Farm Owners'}</span>
          <h1 style="font-size: 2rem; font-weight: 800; color: var(--color-secondary); margin: 8px 0 4px;">
            ${isRtl ? 'بيع سريع بمساعدة إدارة فارمين' : 'Quick Sell Assisted'}
          </h1>
          <p style="color: var(--color-text-muted); margin: 0; line-height: 1.6;">
            ${isRtl ? 'اعرض مزرعتك للبيع السريع مع مساعدة الإدارة في المعاينة ومطابقة المشترين الجادين، مع إمكانية التقسيط أو المبادلة بأصول.' : 'Sell your farm quickly with administrative assistance, matching qualified buyers, with flexible installment or exchange options.'}
          </p>
        </div>

        <form id="quick-sell-form" class="stack" style="gap: var(--space-4);">
          <div class="grid grid--cols-2" style="gap: var(--space-4);">
            <div class="form-group" style="margin: 0;">
              <label class="form-label">${isRtl ? 'اسم المالك بالكامل' : 'Full Name'}</label>
              <input type="text" name="fullName" required class="form-control" placeholder="${isRtl ? 'محمد عبد الله' : 'Full Name'}">
            </div>
            <div class="form-group" style="margin: 0;">
              <label class="form-label">${isRtl ? 'رقم الهاتف / الواتساب' : 'Mobile Number'}</label>
              <input type="tel" name="mobile" required class="form-control" placeholder="+20 100 000 0000">
            </div>
          </div>

          <div class="grid grid--cols-2" style="gap: var(--space-4);">
            <div class="form-group" style="margin: 0;">
              <label class="form-label">${isRtl ? 'اسم أو وصف المزرعة' : 'Farm Reference Name'}</label>
              <input type="text" name="farmName" required class="form-control" placeholder="${isRtl ? 'مزرعة زيتون بطريق العلمين' : 'Olive farm Alamein road'}">
            </div>
            <div class="form-group" style="margin: 0;">
              <label class="form-label">${isRtl ? 'المحافظة' : 'Governorate'}</label>
              <select name="governorateId" class="form-control">
                ${locations.map(loc => `<option value="${loc.id}">${isRtl ? loc.name_ar : loc.name_en}</option>`).join('')}
              </select>
            </div>
          </div>

          <div class="grid grid--cols-2" style="gap: var(--space-4);">
            <div class="form-group" style="margin: 0;">
              <label class="form-label">${isRtl ? 'المساحة (فدان)' : 'Area (Feddan)'}</label>
              <input type="number" name="areaFeddan" required class="form-control" placeholder="50">
            </div>
            <div class="form-group" style="margin: 0;">
              <label class="form-label">${isRtl ? 'السعر المطلوب (جنيه)' : 'Asking Price (EGP)'}</label>
              <input type="number" name="askingPrice" required class="form-control" placeholder="15000000">
            </div>
          </div>

          <div class="cluster" style="gap: var(--space-6); padding-block: 4px;">
            <label class="cluster" style="gap: 8px; cursor: pointer;">
              <input type="checkbox" name="installments" value="true">
              <span style="font-weight: 600;">${isRtl ? 'أقبل البيع بالتقسيط' : 'Accept Installments'}</span>
            </label>
            <label class="cluster" style="gap: 8px; cursor: pointer;">
              <input type="checkbox" name="exchange" value="true">
              <span style="font-weight: 600;">${isRtl ? 'أقبل المبادلة بأصول' : 'Accept Asset Exchange'}</span>
            </label>
          </div>

          <div class="form-group" style="margin: 0;">
            <label class="form-label">${isRtl ? 'تفاصيل المزرعة ومصادر المياه والري' : 'Farm Details (Water, power, trees)'}</label>
            <textarea name="farmDetails" rows="3" class="form-control" placeholder="${isRtl ? 'بئر ارتوازي، شبكة ري، نوع الشجر...' : 'Well specs, irrigation, trees...'}"></textarea>
          </div>

          <button type="submit" class="btn btn--primary" style="height: 48px; font-weight: 700; font-size: 1rem; margin-top: 8px;">
            ${isRtl ? 'إرسال طلب البيع للمعاينة' : 'Submit Assisted Sell Request'}
          </button>
        </form>
      </div>
    </div>

    <script>
      document.getElementById('quick-sell-form')?.addEventListener('submit', async function(e) {
        e.preventDefault();
        const data = Object.fromEntries(new FormData(this).entries());
        data.installments = !!data.installments;
        data.exchange = !!data.exchange;
        try {
          const res = await fetch('/api/quick-sell', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
          });
          const resData = await res.json();
          if (res.ok) {
            alert(resData.message || 'Submitted successfully');
            this.reset();
          } else {
            alert(resData.error || 'Error submitting');
          }
        } catch (e) {
          alert(e.message);
        }
      });
    </script>
  `;
}

export function renderSuppliersPage({ lang, suppliers = [], categories = [] }) {
  const isRtl = lang === 'ar';

  return `
    <div style="background: var(--color-surface-alt); border-bottom: 1px solid var(--color-border); padding-block: var(--space-8);">
      <div class="container">
        <h1 style="font-size: 2.2rem; font-weight: 800; color: var(--color-secondary); margin: 0 0 8px;">
          ${isRtl ? 'دليل الشركات والموردين الزراعيين' : 'Agricultural Suppliers Directory'}
        </h1>
        <p style="color: var(--color-text-muted); margin: 0; font-size: 1.05rem;">
          ${isRtl ? 'شركات موثوقة في شبكات الري، الطاقة الشمسية، التقاوي، الأسمدة، والميكنة الزراعية' : 'Certified vendors for modern irrigation, solar pumping, certified seedlings, and fertilizers'}
        </p>
      </div>
    </div>

    <div class="container stack" style="padding-block: var(--space-8); gap: var(--space-6);">
      <div class="grid grid--cols-3" style="gap: var(--space-6);">
        ${suppliers.map(s => `
          <div class="card stack" style="padding: var(--space-5); gap: var(--space-3); background: #ffffff;">
            <div class="cluster" style="gap: 12px;">
              <img src="${escapeHtml(s.logo_url || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=120&q=80')}" alt="${escapeHtml(s.company_name_en)}" style="width: 50px; height: 50px; border-radius: 8px; object-fit: cover;">
              <div>
                <span class="badge badge--success" style="font-size: 0.7rem; padding: 2px 6px;">✔ ${isRtl ? 'مورد معتمد' : 'Verified Vendor'}</span>
                <h3 style="font-size: 1.15rem; font-weight: 700; margin: 2px 0 0;">
                  ${escapeHtml(isRtl ? s.company_name_ar : s.company_name_en)}
                </h3>
              </div>
            </div>

            <p style="font-size: 0.9rem; color: var(--color-text-secondary); line-height: 1.6; margin: 0;">
              ${escapeHtml(isRtl ? s.description_ar : s.description_en)}
            </p>

            <div style="border-top: 1px solid var(--color-border); padding-top: var(--space-3); display: flex; justify-content: space-between; align-items: center;">
              <span style="font-size: 0.85rem; color: var(--color-text-muted);">
                📞 ${escapeHtml(s.phone)}
              </span>
              <a href="https://wa.me/${s.whatsapp.replace(/[^0-9]/g, '')}" target="_blank" class="whatsapp-btn btn btn--sm" style="border-radius: 6px;">
                ${isRtl ? 'طلب تسعير' : 'Get Quote'}
              </a>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

export function renderHumanResourcesPage({ lang, specialists = [], categories = [] }) {
  const isRtl = lang === 'ar';

  return `
    <div style="background: var(--color-surface-alt); border-bottom: 1px solid var(--color-border); padding-block: var(--space-8);">
      <div class="container">
        <h1 style="font-size: 2.2rem; font-weight: 800; color: var(--color-secondary); margin: 0 0 8px;">
          ${isRtl ? 'الكوادر والخبراء الزراعيين' : 'Agricultural Human Resources'}
        </h1>
        <p style="color: var(--color-text-muted); margin: 0; font-size: 1.05rem;">
          ${isRtl ? 'نخبة المهندسين الزراعيين ومديري المزارع واستشاريي الثروة الحيوانية' : 'Certified agronomists, farm general managers, irrigation specialists, and veterinarians'}
        </p>
      </div>
    </div>

    <div class="container stack" style="padding-block: var(--space-8); gap: var(--space-6);">
      <div class="grid grid--cols-3" style="gap: var(--space-6);">
        ${specialists.map(sp => `
          <div class="card stack" style="padding: var(--space-5); gap: var(--space-3); background: #ffffff;">
            <div class="cluster" style="gap: 12px;">
              <img src="${escapeHtml(sp.avatar_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80')}" alt="${escapeHtml(sp.full_name_en)}" style="width: 56px; height: 56px; border-radius: 50%; object-fit: cover;">
              <div>
                <h3 style="font-size: 1.15rem; font-weight: 700; margin: 0;">
                  ${escapeHtml(isRtl ? sp.full_name_ar : sp.full_name_en)}
                </h3>
                <span style="font-size: 0.85rem; color: var(--color-primary); font-weight: 600;">
                  ${escapeHtml(isRtl ? sp.title_ar : sp.title_en)}
                </span>
              </div>
            </div>

            <div class="cluster" style="gap: 6px;">
              <span class="spec-pill"><strong>${sp.experience_years}</strong> ${isRtl ? 'سنوات خبرة' : 'Years Exp'}</span>
              <span class="badge badge--success" style="font-size: 0.72rem;">✔ ${isRtl ? 'مؤهل معتمد' : 'Verified'}</span>
            </div>

            <p style="font-size: 0.9rem; color: var(--color-text-secondary); line-height: 1.6; margin: 0;">
              ${escapeHtml(isRtl ? sp.bio_ar : sp.bio_en)}
            </p>

            <div style="border-top: 1px solid var(--color-border); padding-top: var(--space-3); display: flex; justify-content: space-between; align-items: center;">
              <span style="font-size: 0.85rem; color: var(--color-text-muted);">
                📞 ${escapeHtml(sp.phone)}
              </span>
              <a href="https://wa.me/${sp.whatsapp.replace(/[^0-9]/g, '')}" target="_blank" class="btn btn--sm btn--primary">
                ${isRtl ? 'طلب توظيف' : 'Hire / Contact'}
              </a>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

export function renderSignInPage({ lang }) {
  const isRtl = lang === 'ar';

  return `
    <div class="container" style="padding-block: var(--space-12); max-inline-size: 460px;">
      <div class="card stack" style="padding: var(--space-8); gap: var(--space-5); background: #ffffff;">
        <div style="text-align: center;">
          <h1 style="font-size: 1.8rem; font-weight: 800; color: var(--color-secondary); margin: 0 0 6px;">
            ${isRtl ? 'تسجيل الدخول إلى فارمين' : 'Sign In to FARMINN'}
          </h1>
          <p style="color: var(--color-text-muted); margin: 0; font-size: 0.95rem;">
            ${isRtl ? 'أو أنشئ حساباً جديداً لإدارة مزارعك واستثماراتك' : 'Access your personal dashboard & listings'}
          </p>
        </div>

        <!-- Tabs -->
        <div class="cluster" style="border-bottom: 2px solid var(--color-border); gap: 0;">
          <button type="button" id="tab-login-btn" class="btn btn--ghost" style="flex: 1; border-radius: 0; border-bottom: 2px solid var(--color-primary); font-weight: 700; color: var(--color-primary);">
            ${isRtl ? 'تسجيل الدخول' : 'Sign In'}
          </button>
          <button type="button" id="tab-register-btn" class="btn btn--ghost" style="flex: 1; border-radius: 0; font-weight: 600; color: var(--color-text-muted);">
            ${isRtl ? 'إنشاء حساب جديد' : 'Register'}
          </button>
        </div>

        <!-- Login Form -->
        <form id="login-form" class="stack" style="gap: var(--space-4);">
          <div class="form-group" style="margin: 0;">
            <label class="form-label">${isRtl ? 'البريد الإلكتروني' : 'Email Address'}</label>
            <input type="email" name="email" required class="form-control" placeholder="user@example.com">
          </div>

          <div class="form-group" style="margin: 0;">
            <label class="form-label">${isRtl ? 'كلمة المرور' : 'Password'}</label>
            <input type="password" name="password" required class="form-control" placeholder="••••••••">
          </div>

          <div class="cluster" style="justify-content: space-between; font-size: 0.85rem;">
            <label class="cluster" style="gap: 6px; cursor: pointer;">
              <input type="checkbox" name="rememberMe" value="true">
              <span>${isRtl ? 'تذكرني' : 'Remember me'}</span>
            </label>
          </div>

          <button type="submit" class="btn btn--primary" style="height: 46px; font-weight: 700;">
            ${isRtl ? 'دخول' : 'Sign In'}
          </button>
        </form>

        <!-- Register Form (hidden initially) -->
        <form id="register-form" class="stack" style="gap: var(--space-4); display: none;">
          <div class="form-group" style="margin: 0;">
            <label class="form-label">${isRtl ? 'الاسم بالكامل' : 'Full Name'}</label>
            <input type="text" name="fullName" required class="form-control" placeholder="${isRtl ? 'أحمد منصور' : 'Your Name'}">
          </div>

          <div class="form-group" style="margin: 0;">
            <label class="form-label">${isRtl ? 'البريد الإلكتروني' : 'Email Address'}</label>
            <input type="email" name="email" required class="form-control" placeholder="user@example.com">
          </div>

          <div class="form-group" style="margin: 0;">
            <label class="form-label">${isRtl ? 'رقم الهاتف / الواتساب' : 'Mobile Number'}</label>
            <input type="tel" name="mobile" required class="form-control" placeholder="+20 100 000 0000">
          </div>

          <div class="form-group" style="margin: 0;">
            <label class="form-label">${isRtl ? 'نوع الحساب' : 'Account Type'}</label>
            <select name="accountType" class="form-control">
              <option value="buyer">${isRtl ? 'مشتري / مستثمر زراعي' : 'Buyer / Investor'}</option>
              <option value="farm_owner">${isRtl ? 'مالك مزرعة' : 'Farm Owner'}</option>
              <option value="farm_manager">${isRtl ? 'مهندس / مدير مزرعة' : 'Agronomist / Farm Manager'}</option>
              <option value="supplier">${isRtl ? 'شركة توريدات زراعية' : 'Agricultural Supplier'}</option>
            </select>
          </div>

          <div class="form-group" style="margin: 0;">
            <label class="form-label">${isRtl ? 'كلمة المرور' : 'Password'}</label>
            <input type="password" name="password" required class="form-control" placeholder="••••••••">
          </div>

          <button type="submit" class="btn btn--primary" style="height: 46px; font-weight: 700;">
            ${isRtl ? 'إنشاء الحساب' : 'Create Account'}
          </button>
        </form>

        <div id="auth-msg" style="font-size: 0.9rem; text-align: center; display: none;"></div>
      </div>
    </div>

    <script>
      const tabLogin = document.getElementById('tab-login-btn');
      const tabReg = document.getElementById('tab-register-btn');
      const formLogin = document.getElementById('login-form');
      const formReg = document.getElementById('register-form');
      const msgBox = document.getElementById('auth-msg');

      tabLogin.addEventListener('click', () => {
        formLogin.style.display = 'flex';
        formReg.style.display = 'none';
        tabLogin.style.borderColor = 'var(--color-primary)';
        tabLogin.style.color = 'var(--color-primary)';
        tabReg.style.borderColor = 'transparent';
        tabReg.style.color = 'var(--color-text-muted)';
      });

      tabReg.addEventListener('click', () => {
        formLogin.style.display = 'none';
        formReg.style.display = 'flex';
        tabReg.style.borderColor = 'var(--color-primary)';
        tabReg.style.color = 'var(--color-primary)';
        tabLogin.style.borderColor = 'transparent';
        tabLogin.style.color = 'var(--color-text-muted)';
      });

      formLogin.addEventListener('submit', async function(e) {
        e.preventDefault();
        msgBox.style.display = 'none';
        const data = Object.fromEntries(new FormData(this).entries());
        try {
          const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
          });
          const resData = await res.json();
          if (res.ok) {
            window.location.href = '/${lang}/my';
          } else {
            msgBox.style.display = 'block';
            msgBox.style.color = 'var(--color-danger)';
            msgBox.innerText = resData.error || 'Login failed';
          }
        } catch (e) {
          msgBox.style.display = 'block';
          msgBox.style.color = 'var(--color-danger)';
          msgBox.innerText = e.message;
        }
      });

      formReg.addEventListener('submit', async function(e) {
        e.preventDefault();
        msgBox.style.display = 'none';
        const data = Object.fromEntries(new FormData(this).entries());
        try {
          const res = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
          });
          const resData = await res.json();
          if (res.ok) {
            window.location.href = '/${lang}/my';
          } else {
            msgBox.style.display = 'block';
            msgBox.style.color = 'var(--color-danger)';
            msgBox.innerText = resData.error || 'Registration failed';
          }
        } catch (e) {
          msgBox.style.display = 'block';
          msgBox.style.color = 'var(--color-danger)';
          msgBox.innerText = e.message;
        }
      });
    </script>
  `;
}

export function renderUserDashboardPage({ lang, user, data = {} }) {
  const isRtl = lang === 'ar';
  const stats = data.stats || {};
  const farms = data.farms || [];

  return `
    <div style="background: var(--color-surface-alt); border-bottom: 1px solid var(--color-border); padding-block: var(--space-8);">
      <div class="container cluster" style="justify-content: space-between; align-items: center;">
        <div>
          <span class="badge badge--primary">${user.role_name || user.account_type}</span>
          <h1 style="font-size: 2.2rem; font-weight: 800; color: var(--color-secondary); margin: 6px 0 2px;">
            ${isRtl ? 'مرحباً،' : 'Welcome,'} ${escapeHtml(user.full_name)}
          </h1>
          <p style="color: var(--color-text-muted); margin: 0;">${escapeHtml(user.email)} · ${escapeHtml(user.mobile_number || '')}</p>
        </div>
        <button type="button" class="btn btn--primary" id="open-new-farm-btn">
          + ${isRtl ? 'إضافة مزرعة جديدة' : 'List New Farm'}
        </button>
      </div>
    </div>

    <div class="container stack" style="padding-block: var(--space-8); gap: var(--space-8);">
      <!-- Stats Overview -->
      <div class="grid grid--cols-4" style="gap: var(--space-4);">
        <div class="card" style="text-align: center; padding: var(--space-4);">
          <div style="font-size: 1.8rem; font-weight: 800; color: var(--color-primary);">${stats.farms || 0}</div>
          <div style="font-size: 0.85rem; color: var(--color-text-muted);">${isRtl ? 'مزارعي المعروضة' : 'My Listings'}</div>
        </div>
        <div class="card" style="text-align: center; padding: var(--space-4);">
          <div style="font-size: 1.8rem; font-weight: 800; color: var(--color-accent);">${stats.managementRequests || 0}</div>
          <div style="font-size: 0.85rem; color: var(--color-text-muted);">${isRtl ? 'طلبات الإدارة' : 'Mgmt Requests'}</div>
        </div>
        <div class="card" style="text-align: center; padding: var(--space-4);">
          <div style="font-size: 1.8rem; font-weight: 800; color: #0369a1;">${stats.proposals || 0}</div>
          <div style="font-size: 0.85rem; color: var(--color-text-muted);">${isRtl ? 'عروض الإدارة' : 'Proposals'}</div>
        </div>
        <div class="card" style="text-align: center; padding: var(--space-4);">
          <div style="font-size: 1.8rem; font-weight: 800; color: #059669;">${stats.quickRequests || 0}</div>
          <div style="font-size: 0.85rem; color: var(--color-text-muted);">${isRtl ? 'طلبات الشراء والبيع' : 'Quick Requests'}</div>
        </div>
      </div>

      <!-- User Listings Table -->
      <div class="card stack" style="gap: var(--space-4); padding: var(--space-6); background: #ffffff;">
        <h2 style="font-size: 1.3rem; font-weight: 700; margin: 0;">
          ${isRtl ? 'المزارع المسجلة باسمك' : 'Your Farm Listings'}
        </h2>

        ${farms.length === 0 ? `
          <p style="color: var(--color-text-muted); margin: 0;">
            ${isRtl ? 'لم تقم بإضافة أي مزارع بعد. اضغط على الزر بالأعلى لإضافة مزرعتك الأولى.' : 'You have not listed any farms yet. Click the button above to add your first listing.'}
          </p>
        ` : `
          <table class="table">
            <thead>
              <tr>
                <th>${isRtl ? 'المزرعة' : 'Farm'}</th>
                <th>${isRtl ? 'المساحة' : 'Area'}</th>
                <th>${isRtl ? 'السعر' : 'Price'}</th>
                <th>${isRtl ? 'الحالة' : 'Status'}</th>
                <th>${isRtl ? 'المشاهدات' : 'Views'}</th>
              </tr>
            </thead>
            <tbody>
              ${farms.map(f => `
                <tr>
                  <td>
                    <strong>${escapeHtml(isRtl ? (f.title_ar || f.title_en) : f.title_en)}</strong>
                    <div style="font-size: 0.8rem; color: var(--color-text-muted);">${escapeHtml(f.gov_name_en)}</div>
                  </td>
                  <td>${f.area_feddan} ${isRtl ? 'فدان' : 'Feddan'}</td>
                  <td>${formatEgp(f.price)} EGP</td>
                  <td>
                    <span class="badge ${f.status === 'approved' ? 'badge--success' : 'badge--warning'}">
                      ${f.status}
                    </span>
                  </td>
                  <td>${f.view_count || 0}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        `}
      </div>
    </div>
  `;
}

export function renderAboutPage({ lang }) {
  const isRtl = lang === 'ar';

  return `
    <div style="background: var(--color-surface-alt); border-bottom: 1px solid var(--color-border); padding-block: var(--space-10);">
      <div class="container" style="max-inline-size: 800px;">
        <h1 style="font-size: 2.4rem; font-weight: 800; color: var(--color-secondary); margin: 0 0 10px;">
          ${isRtl ? 'عن منصة فارمين' : 'About FARMINN'}
        </h1>
        <p style="font-size: 1.15rem; color: var(--color-text-muted); margin: 0; line-height: 1.6;">
          ${isRtl ? 'المنصة الرائدة في جمهورية مصر العربية المتخصصة حصرياً في الاستثمار العقاري الزراعي وإدارة وتشغيل المزارع وفق أعلى المعايير الهندسية والقانونية.' : "Egypt's premier marketplace dedicated exclusively to agricultural real estate, professional farm operations, and vetted agribusiness investments."}
        </p>
      </div>
    </div>

    <div class="container stack" style="padding-block: var(--space-10); max-inline-size: 800px; gap: var(--space-6); font-size: 1.05rem; line-height: 1.7; color: var(--color-text-secondary);">
      <h2 style="font-size: 1.6rem; font-weight: 800; color: var(--color-secondary); margin: 0;">
        ${isRtl ? 'رؤيتنا ورسالتنا' : 'Our Vision & Core Standards'}
      </h2>
      <p>
        ${isRtl ? 'تأسست فارمين لمعالجة التحديات التاريخية في القطاع الزراعي: غياب المعاينة الدقيقة، تضارب أوراق الملكية، وصعوبة إيجاد كوادر إدارة وتشغيل موثوقة للأراضي المستصلحة. نجمع كافة أطراف المنظومة في بيئة رقمية محكمة تضمن أمان الاستثمار.' : 'FARMINN was established to resolve the historical hurdles in Egyptian agricultural investment: lack of agronomic validation, murky land tenure, and operational bottlenecks. We unite land owners, institutional investors, agronomists, and suppliers in a verified ecosystem.'}
      </p>

      <div class="card grid grid--cols-2" style="gap: var(--space-4); background: #ffffff; padding: var(--space-6); margin-block: var(--space-4);">
        <div>
          <h3 style="font-size: 1.15rem; font-weight: 700; color: var(--color-primary); margin: 0 0 6px;">
            ${isRtl ? 'توثيق قانوني وفني صارم' : 'Rigorous Legal & Technical Due Diligence'}
          </h3>
          <p style="font-size: 0.9rem; margin: 0; color: var(--color-text-muted);">
            ${isRtl ? 'كل مزرعة تخضع لمراجعة سجلات الشهر العقاري، ملوحة المياه، ومصدر الطاقة قبل النشر.' : 'Every property undergoes official title deed checks, water salinity validation, and soil suitability scans.'}
          </p>
        </div>
        <div>
          <h3 style="font-size: 1.15rem; font-weight: 700; color: var(--color-accent); margin: 0 0 6px;">
            ${isRtl ? 'إشراف هندسي متكامل' : 'Full-Spectrum Farm Management'}
          </h3>
          <p style="font-size: 0.9rem; margin: 0; color: var(--color-text-muted);">
            ${isRtl ? 'نساعد الملاك والمستثمرين على التعاقد مع استشاريين زراعيين لإدارة التربة والمحاصيل والتصدير.' : 'We connect investors with proven agronomists to manage irrigation, nutrition, and export harvests.'}
          </p>
        </div>
      </div>
    </div>
  `;
}

export function renderContactPage({ lang, settings = {} }) {
  const isRtl = lang === 'ar';
  const phone = settings.contact_phone || '+20 100 234 5678';
  const whatsapp = settings.whatsapp_number || '+20 100 234 5678';
  const cleanWhatsapp = whatsapp.replace(/[^0-9]/g, '');
  const email = settings.contact_email || 'info@farminn.com';
  const address = isRtl ? (settings.address_ar || 'طريق مصر إسكندرية الصحراوي، الجيزة، مصر') : (settings.address_en || 'Cairo-Alexandria Desert Road, Giza, Egypt');

  return `
    <div style="background: var(--color-surface-alt); border-bottom: 1px solid var(--color-border); padding-block: var(--space-8);">
      <div class="container">
        <h1 style="font-size: 2.2rem; font-weight: 800; color: var(--color-secondary); margin: 0 0 8px;">
          ${isRtl ? 'اتصل بنا وفريق المعاينة' : 'Contact Us & Field Visits'}
        </h1>
        <p style="color: var(--color-text-muted); margin: 0; font-size: 1.05rem;">
          ${isRtl ? 'فريقنا متاح للرد على استفساراتكم وترتيب مواعيد المعاينات الميدانية' : 'Our agricultural advisors are available for inquiries and field inspections'}
        </p>
      </div>
    </div>

    <div class="container grid" style="grid-template-columns: 1fr 1fr; gap: var(--space-8); padding-block: var(--space-10);">
      <!-- Contact Details -->
      <div class="card stack" style="padding: var(--space-8); gap: var(--space-5); background: #ffffff;">
        <h2 style="font-size: 1.4rem; font-weight: 800; color: var(--color-secondary); margin: 0;">
          ${isRtl ? 'المقر الرئيسي وقنوات التواصل' : 'Headquarters & Channels'}
        </h2>

        <div class="stack" style="gap: var(--space-3); font-size: 1rem; color: var(--color-text-secondary);">
          <div>
            <strong>${isRtl ? 'المقر الميداني:' : 'Field Office:'}</strong><br>
            ${escapeHtml(address)}
          </div>
          <div>
            <strong>${isRtl ? 'البريد الإلكتروني:' : 'Email Address:'}</strong><br>
            ${escapeHtml(email)}
          </div>
          <div>
            <strong>${isRtl ? 'الهاتف المباشر:' : 'Direct Phone:'}</strong><br>
            ${escapeHtml(phone)}
          </div>
        </div>

        <a href="https://wa.me/${cleanWhatsapp}" target="_blank" class="whatsapp-btn btn" style="height: 48px; border-radius: 8px;">
          ${isRtl ? 'مراسلتنا فوراً عبر واتساب' : 'Chat via WhatsApp'}
        </a>
      </div>

      <!-- Message Form -->
      <div class="card stack" style="padding: var(--space-8); gap: var(--space-4); background: #ffffff;">
        <h2 style="font-size: 1.4rem; font-weight: 800; color: var(--color-secondary); margin: 0;">
          ${isRtl ? 'أرسل لنا استفسارك' : 'Send an Inquiry'}
        </h2>

        <form class="stack" style="gap: var(--space-3);">
          <div class="form-group" style="margin: 0;">
            <label class="form-label">${isRtl ? 'الاسم بالكامل' : 'Full Name'}</label>
            <input type="text" name="name" required class="form-control">
          </div>
          <div class="form-group" style="margin: 0;">
            <label class="form-label">${isRtl ? 'البريد الإلكتروني' : 'Email'}</label>
            <input type="email" name="email" required class="form-control">
          </div>
          <div class="form-group" style="margin: 0;">
            <label class="form-label">${isRtl ? 'رقم الهاتف' : 'Phone'}</label>
            <input type="tel" name="phone" required class="form-control">
          </div>
          <div class="form-group" style="margin: 0;">
            <label class="form-label">${isRtl ? 'الرسالة' : 'Message'}</label>
            <textarea name="message" rows="3" required class="form-control"></textarea>
          </div>
          <button type="submit" class="btn btn--primary" style="height: 44px; margin-top: 6px;">
            ${isRtl ? 'إرسال الرسالة' : 'Send Message'}
          </button>
        </form>
      </div>
    </div>
  `;
}

export function renderTermsPage({ lang }) {
  const isRtl = lang === 'ar';

  return `
    <div class="container stack" style="padding-block: var(--space-10); max-inline-size: 800px; gap: var(--space-6);">
      <h1 style="font-size: 2.2rem; font-weight: 800; color: var(--color-secondary); margin: 0;">
        ${isRtl ? 'الشروط والأحكام وسياسة الخصوصية' : 'Terms of Use & Privacy Policy'}
      </h1>
      <p style="color: var(--color-text-muted); margin: 0;">
        ${isRtl ? 'تاريخ التحديث: نوفمبر 2026' : 'Last updated: November 2026'}
      </p>

      <div class="card stack" style="padding: var(--space-6); gap: var(--space-4); background: #ffffff; line-height: 1.7; color: var(--color-text-secondary);">
        <h2 style="font-size: 1.25rem; font-weight: 700; color: var(--color-secondary); margin: 0;">
          ${isRtl ? '1. شروط استخدام منصة فارمين' : '1. Terms of Service'}
        </h2>
        <p>
          ${isRtl ? 'تعتبر منصة فارمين وسيطاً تقنياً موثقاً يربط بين المشترين والبائعين ومديري المزارع. تخضع جميع العروض المنشورة للمراجعة الإدارية ولا تعتبر المنصة طرفاً في العقود المباشرة ما لم يتم التعاقد عبر خدمة إدارة الصفقات المعتمدة.' : 'FARMINN provides a verified platform connecting buyers, sellers, farm managers, and vendors. All public listings undergo review, and direct transactions are governed by legal agreements executed between the respective parties.'}
        </p>

        <h2 style="font-size: 1.25rem; font-weight: 700; color: var(--color-secondary); margin: 0;">
          ${isRtl ? '2. الخصوصية وحماية البيانات' : '2. Privacy & Data Protection'}
        </h2>
        <p>
          ${isRtl ? 'نلتزم بحماية البيانات الشخصية ومستندات الملكية المشهرة. لا يتم مشاركة المستندات الرسمية أو عقود الملكية إلا مع المستثمرين الجادين بعد موافقة إدارة المنصة والمالك.' : 'We protect all personal data and property deeds. Official land title deeds are shared strictly with verified qualified buyers following administrative clearance.'}
        </p>
      </div>
    </div>
  `;
}

