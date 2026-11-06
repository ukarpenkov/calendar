import { useEffect, type Dispatch, type SetStateAction } from 'react';
import { BackHandler } from 'react-native';

import type { VacationPeriod } from '../../features/vacation/model';
import type { AppContentStatus } from './user-flow';

type UseHardwareBackArgs = {
  status: AppContentStatus;
  showVacationForm: boolean;
  setClosingSettings: (closing: boolean) => void;
  setShowVacationForm: (visible: boolean) => void;
  setEditingPeriod: Dispatch<SetStateAction<VacationPeriod | null>>;
  setStatus: Dispatch<SetStateAction<AppContentStatus>>;
};

/** Android back: close the top layer, then return to the previous screen. */
export function useHardwareBack({
  status,
  showVacationForm,
  setClosingSettings,
  setShowVacationForm,
  setEditingPeriod,
  setStatus,
}: UseHardwareBackArgs) {
  useEffect(() => {
    const onBackPress = () => {
      if (status.kind !== 'ready') {
        return false;
      }

      switch (status.screen.name) {
        case 'settings':
          setClosingSettings(true);
          return true;
        case 'month-error':
        case 'import-entry':
        case 'vacation':
          if (status.screen.name === 'vacation' && showVacationForm) {
            setShowVacationForm(false);
            setEditingPeriod(null);
            return true;
          }
          setStatus(current => {
            if (current.kind !== 'ready') {
              return current;
            }
            const screenName = current.screen.name;
            if (screenName === 'month-error') {
              return { ...current, screen: { name: 'year' } };
            }
            if (screenName === 'import-entry') {
              return { ...current, screen: { name: 'settings' } };
            }
            if (screenName === 'vacation') {
              return { ...current, screen: { name: 'year' } };
            }
            return current;
          });
          return true;
        default:
          return false;
      }
    };

    const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => sub.remove();
  }, [
    setClosingSettings,
    setEditingPeriod,
    setShowVacationForm,
    setStatus,
    showVacationForm,
    status,
  ]);
}
