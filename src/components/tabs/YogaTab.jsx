export default function YogaTab({ kundali, t, lang }) {
  const { yogas } = kundali;
  const rajaYogas = yogas.filter(y => y.type === 'raja');
  const dhanaYogas = yogas.filter(y => y.type === 'dhana');
  const doshas = yogas.filter(y => y.type === 'dosha');
  const noYogas = yogas.length === 0;

  const getTranslatedVars = (vars) => {
    const res = {};
    for (const [k, v] of Object.entries(vars || {})) {
      if (['p1', 'p2'].includes(k)) res[k] = t(`pl.${v}`, lang) || v;
      else if (k === 'rashi') res[k] = t(`yo.rashi.${v}`, lang) || v;
      else res[k] = t(`yo.val.${v}`, lang) || v;
    }
    return res;
  };

  const YogaCard = ({ yoga }) => {
    const tVars = getTranslatedVars(yoga.vars);
    let calcStr = t(`yo.calc.${yoga.key}`, lang) || '';
    for (const [k, v] of Object.entries(tVars)) {
      calcStr = calcStr.replace(`{${k}}`, v);
    }
    
    return (
    <div style={{
      background: 'white',
      border: `1px solid ${yoga.type === 'dosha' ? '#FECDD3' : '#E5D5C0'}`,
      borderRadius: 10, padding: 20,
      borderLeft: `4px solid ${yoga.type === 'dosha' ? '#EF4444' : yoga.type === 'dhana' ? '#10B981' : '#7C3AED'}`,
      transition: 'box-shadow 0.2s',
    }}
    onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(124,58,237,0.1)'}
    onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <h4 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: yoga.type === 'dosha' ? '#DC2626' : '#1E3A5F' }}>{t(`yo.name.${yoga.key}`, lang) || yoga.key}</h4>
        <span style={{
          fontSize: 10, padding: '3px 10px', borderRadius: 10, fontWeight: 700, textTransform: 'uppercase',
          background: yoga.type === 'dosha' ? '#FEE2E2' : yoga.type === 'dhana' ? '#DCFCE7' : '#F5F0FF',
          color: yoga.type === 'dosha' ? '#DC2626' : yoga.type === 'dhana' ? '#16A34A' : '#7C3AED',
        }}>
          {yoga.type === 'dosha' ? (t('yo.doshaLabel', lang) || 'Dosha') : yoga.type === 'dhana' ? (t('yo.dhanaYoga', lang) || 'Dhana Yoga') : (t('yo.rajaYoga', lang) || 'Raja Yoga')}
        </span>
      </div>
      <p style={{ margin: '0 0 10px', fontSize: 13, color: 'var(--accent-gold)', fontWeight: 600 }}>
        {t('yo.formedBy', lang) || 'Formed by'}: <span style={{color: '#6B7280', fontWeight: 'normal'}}>{calcStr}</span>
      </p>
      <p style={{ margin: 0, fontSize: 13, color: '#374151', lineHeight: 1.7 }}>{t(`yo.eff.${yoga.key}`, lang)}</p>
      {yoga.type === 'dosha' && (
        <div style={{ marginTop: 12, padding: 12, background: '#FEF2F2', borderRadius: 6, border: '1px dashed #FCA5A5' }}>
          <strong style={{ color: '#B91C1C', fontSize: 12 }}>{t('yo.remedyLabel', lang) || 'Remedies'}:</strong>
          <p style={{ margin: '4px 0 0', fontSize: 12, color: '#991B1B', lineHeight: 1.5 }}>
            {t(`yo.rem.${yoga.key}`, lang)}
          </p>
        </div>
      )}
    </div>
  )};

  const Section = ({ title, items, emptyMsg, icon }) => (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <span style={{ fontSize: 18 }}>{icon}</span>
        <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#1E3A5F' }}>{title}</h3>
        <span style={{ fontSize: 12, color: '#9CA3AF', marginLeft: 4 }}>({items.length})</span>
      </div>
      {items.length > 0 ? (
        <div style={{ display: 'grid', gap: 12 }}>
          {items.map((y, i) => <YogaCard key={i} yoga={y} />)}
        </div>
      ) : (
        <div style={{ background: '#FAFAF8', borderRadius: 8, padding: '14px 18px', border: '1px dashed #E5D5C0', color: '#9CA3AF', fontSize: 13 }}>
          {emptyMsg}
        </div>
      )}
    </div>
  );

  return (
    <div style={{ animation: 'slideIn 0.25s ease' }}>
      {noYogas && (
        <div style={{ background: '#FFF7ED', borderRadius: 10, padding: 20, border: '1px solid #FDE68A', marginBottom: 16, color: '#92400E', fontSize: 13 }}>
          No major yogas were detected in this chart. This does not indicate a weak chart — many potent yogas arise from subtle combinations not checked here.
        </div>
      )}

      <Section
        title="Raja & Pancha Mahapurusha Yogas"
        items={rajaYogas}
        emptyMsg="No Raja Yogas detected in this chart."
        icon="👑" />

      <Section
        title="Dhana Yogas (Wealth Combinations)"
        items={dhanaYogas}
        emptyMsg="No Dhana Yogas detected."
        icon="💰" />

      <Section
        title="Doshas (Afflictions)"
        items={doshas}
        emptyMsg="No major Doshas detected — an auspicious indication."
        icon="⚠️" />

      {/* Dosha notes */}
      {doshas.length > 0 && (
        <div style={{ background: '#FFF7ED', borderRadius: 8, padding: '14px 18px', border: '1px solid #FDE68A', fontSize: 12, color: '#92400E' }}>
          <strong>Remedies:</strong> Doshas identified above may be mitigated through Graha Shanti Pujas, gemstone prescriptions by a qualified Jyotishi, charitable acts (Dana), and regular spiritual practice (Sadhana). Consult an experienced Jyotishi for personalized remedies.
        </div>
      )}
    </div>
  );
}
