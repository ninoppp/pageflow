import React, {useRef, useEffect, useContext, useMemo, createContext} from 'react';
import classNames from 'classnames';
import {useOnScreen} from './useOnScreen';
import {useDelayedBoolean} from './useDelayedBoolean';

import styles from './useScrollPositionLifecycle.module.css';

const StaticPreviewContext = createContext(false);

export function StaticPreview({children}) {
  return (
    <StaticPreviewContext.Provider value={true}>
      {children}
    </StaticPreviewContext.Provider>
  );
}

/**
 * Use inside a content element component to determine whether the
 * component is being rendered in a static preview, e.g. editor
 * thumbnails.
 *
 * @example
 * const isStaticPreview = useIsStaticPreview();
 */
export function useIsStaticPreview() {
  return useContext(StaticPreviewContext);
}

export function createScrollPositionLifecycleProvider(Context) {
  return function ScrollPositionLifecycleProvider({
    children, onActivate, onlyVisibleWhileActive
  }) {
    const ref = useRef();
    const isActiveProbeRef = useRef();

    const isStaticPreview = useContext(StaticPreviewContext);

    const shouldLoad = useOnScreen(ref, {rootMargin: '200% 0px 200% 0px'});
    const shouldPrepare = useOnScreen(ref, {rootMargin: '25% 0px 25% 0px'}) && !isStaticPreview;
    const isOnScreen = useOnScreen(ref) && !isStaticPreview;
    const isActive = useOnScreen(isActiveProbeRef, {
      rootMargin: '-50% 0px -50% 0px',
      onIntersecting: onActivate
    }) && !isStaticPreview;

    // Account for the fact that elements that are only visible while
    // being active (e.g. fade section) might still stay visible
    // during a short transition even after they are no longer active.
    // For example, this prevents background videos in fade sections
    // from already being paused while the section is still fading out.x
    const isActiveWithDelay = useDelayedBoolean(isActive, {fromTrueToFalse: 1000});
    const isVisible = onlyVisibleWhileActive ? isActiveWithDelay : isOnScreen;

    const value = useMemo(() => ({
      shouldLoad, shouldPrepare, isVisible, isActive}
    ), [shouldLoad, shouldPrepare, isVisible, isActive]);

    return (
      <div ref={ref} className={classNames(styles.wrapper)}>
        <div ref={isActiveProbeRef} className={styles.isActiveProbe} />

        <Context.Provider value={value}>
          {children}
        </Context.Provider>
      </div>
    );
  }
}

export function createScrollPositionLifecycleHook(Context) {
  return function useScrollPositionLifecycle({onActivate, onDeactivate, onVisible, onInvisible} = {}) {
    const result = useContext(Context);

    const wasActive = useRef();
    const wasVisible = useRef();

    const {isActive, isVisible} = result || {};

    useEffect(() => {
      if (!wasVisible.current && isVisible && onVisible) {
        onVisible();
      }

      if (!wasActive.current && isActive && onActivate) {
        onActivate();
      }
      else if (wasActive.current && !isActive && onDeactivate) {
        onDeactivate();
      }

      if (wasVisible.current && !isVisible && onInvisible) {
        onInvisible();
      }

      wasActive.current = isActive;
      wasVisible.current = isVisible;
    });

    return result;
  };
}
