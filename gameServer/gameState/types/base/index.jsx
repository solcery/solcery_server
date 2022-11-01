import { DefaultFilterRender } from './components';

export const defaultFilter = {
	eq: (value, filterValue) => value === filterValue,
	render: DefaultFilterRender,
};
