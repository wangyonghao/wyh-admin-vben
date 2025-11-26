import type { VxeGridInstance } from 'vxe-table';

import type { ExtendedFormApi } from '@vben-core/form-ui';

import type { VxeGridProps } from './types';

import { toRaw } from 'vue';

import { Store } from '@vben-core/shared/store';
import {
  bindMethods,
  isBoolean,
  isFunction,
  mergeWithArrayOverride,
  StateHandler,
} from '@vben-core/shared/utils';

function getDefaultState(): VxeGridProps {
  return {
    class: '',
    gridClass: '',
    gridOptions: {},
    gridEvents: {},
    formOptions: undefined,
    showSearchForm: true,
  };
}

export class VxeGridApi<T extends Record<string, any> = any> {
  public formApi = {} as ExtendedFormApi;

  // private prevState: null | VxeGridProps = null;
  public grid = {} as VxeGridInstance<T>;
  public state: null | VxeGridProps<T> = null;

  public store: Store<VxeGridProps<T>>;

  private isMounted = false;

  private stateHandler: StateHandler;

  constructor(options: VxeGridProps = {}) {
    const storeState = { ...options };

    const defaultState = getDefaultState();
    this.store = new Store<VxeGridProps>(
      mergeWithArrayOverride(storeState, defaultState),
      {
        onUpdate: () => {
          // this.prevState = this.state;
          this.state = this.store.state;
        },
      },
    );

    this.state = this.store.state;
    this.stateHandler = new StateHandler();
    bindMethods(this);
  }

  mount(instance: null | VxeGridInstance, formApi: ExtendedFormApi) {
    if (!this.isMounted && instance) {
      this.grid = instance;
      this.formApi = formApi;
      this.stateHandler.setConditionTrue();
      this.isMounted = true;
    }
  }

  /**
   * 触发查询：在 grid 未挂载时等待挂载完成；并检查 commitProxy 是否可用。
   */
  async query(params: Record<string, any> = {}) {
    try {
      if (!this.isMounted) {
        await this.stateHandler.waitForCondition();
      }
      const commit = (this.grid as any)?.commitProxy;
      if (typeof commit !== 'function') {
        console.warn('[VxeGridApi] grid.commitProxy 不可用，请检查 proxyConfig.ajax 是否配置或调用时机是否在挂载之后');
        return;
      }
      await commit('query', toRaw(params));
    } catch (error) {
      console.error('Error occurred while querying:', error);
    }
  }

  /**
   * 触发重载：在 grid 未挂载时等待挂载完成；并检查 commitProxy 是否可用。
   */
  async reload(params: Record<string, any> = {}) {
    try {
      if (!this.isMounted) {
        await this.stateHandler.waitForCondition();
      }
      const commit = (this.grid as any)?.commitProxy;
      if (typeof commit !== 'function') {
        console.warn('[VxeGridApi] grid.commitProxy 不可用，请检查 proxyConfig.ajax 是否配置或调用时机是否在挂载之后');
        return;
      }
      await commit('reload', toRaw(params));
    } catch (error) {
      console.error('Error occurred while reloading:', error);
    }
  }

  setGridOptions(options: Partial<VxeGridProps['gridOptions']>) {
    this.setState({
      gridOptions: options,
    });
  }

  setLoading(isLoading: boolean) {
    this.setState({
      gridOptions: {
        loading: isLoading,
      },
    });
  }

  setState(
    stateOrFn:
      | ((prev: VxeGridProps<T>) => Partial<VxeGridProps<T>>)
      | Partial<VxeGridProps<T>>,
  ) {
    if (isFunction(stateOrFn)) {
      this.store.setState((prev) => {
        return mergeWithArrayOverride(stateOrFn(prev), prev);
      });
    } else {
      this.store.setState((prev) => mergeWithArrayOverride(stateOrFn, prev));
    }
  }

  toggleSearchForm(show?: boolean) {
    this.setState({
      showSearchForm: isBoolean(show) ? show : !this.state?.showSearchForm,
    });
    // nextTick(() => {
    //   this.grid.recalculate();
    // });
    return this.state?.showSearchForm;
  }

  unmount() {
    this.isMounted = false;
    this.stateHandler.reset();
  }
}
