import { DatePicker } from 'antd';
import moment from 'moment';

export const ValueRender = (props) => {
	let format = props.type.excludeTime ? 'MMMM Do YYYY' : 'MMMM Do YYYY HH:mm';
	let defaultValue = props.defaultValue && moment.unix(props.defaultValue);
	if (!props.onChange) return <>{defaultValue && defaultValue.format(format)}</>;

	const onChange = (m) => {
		props.onChange && props.onChange(m.unix());
	};

	return (
		<DatePicker
			format={format}
			showTime={!props.type.excludeTime && { format: 'HH:mm' }}
			defaultValue={defaultValue}
			onChange={onChange}
			width={400}
		/>
	);
};
