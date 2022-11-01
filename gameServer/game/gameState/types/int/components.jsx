import React from 'react';
import { InputNumber } from 'antd';

export const ValueRender = (props) => {

	const onChange = (value) => {
		props.onChange(value !== undefined ? value : null);
	}
	
	if (!props.onChange) return <>{props.defaultValue}</>;
	return (
		<InputNumber
			precision={0}
			defaultValue={props.defaultValue}
			onChange={props.onChange && onChange}
			onPressEnter={props.onPressEnter}
		/>
	);
};
