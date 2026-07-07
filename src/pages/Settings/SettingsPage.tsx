import { useDocumentTitle } from '@/hooks';
import { PageWrapper } from '@/components/ui';
import './SettingsPage.css';

/**
 * Settings placeholder page.
 * Phase 4+ will add theme, font, reading preferences, and cloud sync settings.
 */
export function SettingsPage() {
  useDocumentTitle('Settings');

  return (
    <PageWrapper
      title="Settings"
      description="Customise your Cloud Novel experience."
    >
      <div className="settings-sections">
        <section className="settings-section">
          <h2 className="settings-section__heading">Appearance</h2>
          <div className="settings-row">
            <div className="settings-row__info">
              <span className="settings-row__label">Theme</span>
              <span className="settings-row__hint">
                Light / Dark / System preference
              </span>
            </div>
            <div className="settings-row__control settings-row__control--placeholder">
              Coming soon
            </div>
          </div>
          <div className="settings-row">
            <div className="settings-row__info">
              <span className="settings-row__label">Font Size</span>
              <span className="settings-row__hint">
                Adjust the reader font size
              </span>
            </div>
            <div className="settings-row__control settings-row__control--placeholder">
              Coming soon
            </div>
          </div>
        </section>

        <section className="settings-section">
          <h2 className="settings-section__heading">Sync</h2>
          <div className="settings-row">
            <div className="settings-row__info">
              <span className="settings-row__label">Cloud Sync</span>
              <span className="settings-row__hint">
                Keep your library and progress in sync
              </span>
            </div>
            <div className="settings-row__control settings-row__control--placeholder">
              Coming soon
            </div>
          </div>
        </section>
      </div>
    </PageWrapper>
  );
}
