import React, { useState } from 'react';
import { Image, Input } from 'antd';

export const ValueRender = (props) => {
	var [value, setValue] = useState(props.defaultValue);

	const onChange = (newValue) => {
		setValue(newValue);
		props.onChange && props.onChange(newValue);
	};

	if (!props.onChange) {
		if (!props.defaultValue) return <>No audio</>;
		return <audio controls src={props.defaultValue}/>;
	}
	return (<>
		{value && <audio controls src={value}/>}
		<Input
			type="text"
			defaultValue={value}
			onChange={(event) => {
				onChange(event.target.value);
			}}
		/>
	</>);
};
