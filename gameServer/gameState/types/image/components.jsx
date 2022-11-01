import React, { useState } from 'react';
import { Image, Input } from 'antd';

export const ValueRender = (props) => {
	var [value, setValue] = useState(props.defaultValue);

	const onChange = (newValue) => {
		setValue(newValue);
		props.onChange && props.onChange(newValue);
	};

	if (!props.onChange) {
		if (props.defaultValue)
			return (
				<div>
					<Image
						style={{ objectFit: 'contain' }}
						height={props.type.previewHeight}
						width={props.type.previewWidth}
						src={props.defaultValue}
					/>
				</div>
			);
		return <></>;
	}

	return (
		<>
			<Image style={{ maxHeight: props.type.previewHeight }} width={props.type.previewWidth} src={value} />
			<Input
				type="text"
				defaultValue={value}
				onChange={(event) => {
					onChange(event.target.value);
				}}
			/>
		</>
	);
};
