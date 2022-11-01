import React from 'react';
import { Select } from 'antd';

const { Option } = Select;

export const ValueRender = (props) => {
	let defaultIndex = props.type.values.indexOf(props.defaultValue ?? null);
	if (!props.onChange) {
		return <>{props.type.titles[defaultIndex]}</>;
	}
	return (
		<Select defaultValue={props.type.values[defaultIndex]} onChange={props.onChange}>
			{props.type.titles.map((value, index) => (
				<Option key={index} value={props.type.values[index]}>
					{value}
				</Option>
			))}
		</Select>
	);
};

export const FilterRender = (props) => {
	let defaultIndex = props.type.values.indexOf(props.defaultValue ?? null);
	if (!props.onChange) {
		return <>{props.type.titles[defaultIndex]}</>;
	}
	return (
		<Select defaultValue={props.type.titles[defaultIndex]} onChange={props.onChange}>
			{props.type.titles.map((value, index) => (
				<Option key={index} value={props.type.values[index]}>
					{value}
				</Option>
			))}
		</Select>
	);
};
