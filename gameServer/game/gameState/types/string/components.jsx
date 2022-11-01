import { useEffect, useRef } from 'react';
import { Input } from 'antd';

export const ValueRender = (props) => {
	let valueRenderRef = useRef();

	useEffect(() => {
		if (props.isFilter) {
			setTimeout(() => valueRenderRef.current?.focus(), 100);
		}
	});

	if (!props.onChange) {
		return <>{props.defaultValue}</>;
	}

	return props.type.textArea ? (
		<Input.TextArea
			style={props.type.width && { width: `${props.type.width}px` }}
			type="text"
			ref={valueRenderRef}
			rows={props.type.textArea.rows ?? 5}
			defaultValue={props.defaultValue}
			onPressEnter={props.onPressEnter}
			onChange={(event) => {
				props.onChange && props.onChange(event.target.value);
			}}
		/>
	) : (
		<Input
			style={props.type.width && { width: `${props.type.width}px` }}
			type="text"
			ref={valueRenderRef}
			defaultValue={props.defaultValue}
			onPressEnter={props.onPressEnter}
			onChange={(event) => {
				props.onChange && props.onChange(event.target.value);
			}}
		/>
	);
};
