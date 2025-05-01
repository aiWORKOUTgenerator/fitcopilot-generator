import React from 'react';
import './ColorTest.scss';

/**
 * ColorTest component that displays the new FitCopilot color system
 */
const ColorTest: React.FC = () => {
  return (
    <div className="color-test">
      <h2 className="color-test__title">FitCopilot Color System</h2>
      
      <section className="color-test__section">
        <h3 className="color-test__section-title">Primary Colors (Lime)</h3>
        <div className="color-test__swatches">
          <div className="color-test__swatch color-test__swatch--lime-100"></div>
          <div className="color-test__swatch color-test__swatch--lime-200"></div>
          <div className="color-test__swatch color-test__swatch--lime-300"></div>
          <div className="color-test__swatch color-test__swatch--lime-400"></div>
          <div className="color-test__swatch color-test__swatch--lime-500"></div>
          <div className="color-test__swatch color-test__swatch--lime-600"></div>
          <div className="color-test__swatch color-test__swatch--lime-700"></div>
        </div>
      </section>
      
      <section className="color-test__section">
        <h3 className="color-test__section-title">Secondary Colors (Emerald)</h3>
        <div className="color-test__swatches">
          <div className="color-test__swatch color-test__swatch--emerald-100"></div>
          <div className="color-test__swatch color-test__swatch--emerald-200"></div>
          <div className="color-test__swatch color-test__swatch--emerald-300"></div>
          <div className="color-test__swatch color-test__swatch--emerald-400"></div>
          <div className="color-test__swatch color-test__swatch--emerald-500"></div>
          <div className="color-test__swatch color-test__swatch--emerald-600"></div>
          <div className="color-test__swatch color-test__swatch--emerald-700"></div>
        </div>
      </section>
      
      <section className="color-test__section">
        <h3 className="color-test__section-title">Feature Colors</h3>
        <div className="color-test__features">
          <div className="color-test__feature color-test__feature--virtual">
            <div className="color-test__feature-label">Virtual Training</div>
          </div>
          <div className="color-test__feature color-test__feature--schedule">
            <div className="color-test__feature-label">Scheduling</div>
          </div>
          <div className="color-test__feature color-test__feature--progress">
            <div className="color-test__feature-label">Progress</div>
          </div>
          <div className="color-test__feature color-test__feature--support">
            <div className="color-test__feature-label">Support</div>
          </div>
        </div>
      </section>
      
      <section className="color-test__section">
        <h3 className="color-test__section-title">Semantic Colors</h3>
        <div className="color-test__semantic">
          <button className="color-test__button color-test__button--primary">Primary Button</button>
          <button className="color-test__button color-test__button--secondary">Secondary Button</button>
          <div className="color-test__card">Card Background</div>
          <div className="color-test__text">
            <p className="color-test__text--primary">Primary Text</p>
            <p className="color-test__text--muted">Muted Text</p>
          </div>
        </div>
      </section>
      
      <section className="color-test__section">
        <h3 className="color-test__section-title">Status Colors</h3>
        <div className="color-test__swatches">
          <div className="color-test__swatch color-test__swatch--success">Success</div>
          <div className="color-test__swatch color-test__swatch--error">Error</div>
          <div className="color-test__swatch color-test__swatch--warning">Warning</div>
          <div className="color-test__swatch color-test__swatch--info">Info</div>
        </div>
      </section>
      
      <section className="color-test__section">
        <h3 className="color-test__section-title">Gradients</h3>
        <div className="color-test__gradients">
          <div className="color-test__gradient color-test__gradient--lime">Lime Gradient</div>
          <div className="color-test__gradient color-test__gradient--cyan">Cyan Gradient</div>
          <div className="color-test__gradient color-test__gradient--violet">Violet Gradient</div>
          <div className="color-test__gradient color-test__gradient--amber">Amber Gradient</div>
        </div>
      </section>
    </div>
  );
};

export default ColorTest; 