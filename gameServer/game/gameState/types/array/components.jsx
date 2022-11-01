import { useState } from 'react';
import { Button } from 'antd';

const ADD_ELEMENT_BUTTON_LABEL = ' + ';
const REMOVE_ELEMENT_BUTTON_LABEL = ' - ';

export const ValueRender = (props) => {
	var [value] = useState(props.defaultValue || []);
	const [revision, setRevision] = useState(0);

	const onChange = (newValue, index) => {
		value[index] = newValue;
		if (!props.onChange) return;
		var res = value.filter((entry) => value);
		props.onChange(res);
	};

	const removeElement = (index) => {
		value.splice(index, 1);
		props.onChange(value)
		setRevision(revision + 1);
	};

	const addNewElement = () => {
		value.push(undefined);
		props.onChange(value);
		setRevision(revision + 1);
	};
	if (!props.onChange)
		return (
			<>
				{value.map((val, index) => (
					<div key={index}>
						[{index}] => <props.type.valueType.valueRender defaultValue={val} type={props.type.valueType} />
					</div>
				))}
			</>
		);
	return (
		<>
			{value.map((val, index) => (
				<div style={{ display: 'flex' }} key={`${revision}.${index}`}>
					<Button
						onClick={() => {
							removeElement(index);
						}}
					>
						{REMOVE_ELEMENT_BUTTON_LABEL}
					</Button>
					<props.type.valueType.valueRender
						path={{ ...props.path, fieldPath: [...props.path.fieldPath, 'lol'] }}
						defaultValue={val}
						type={props.type.valueType}
						onChange={(newValue) => {
							onChange(newValue, index);
						}}
					/>
				</div>
			))}
			<Button onClick={addNewElement}>{ADD_ELEMENT_BUTTON_LABEL}</Button>
		</>
	);
};

// export const TypedataRender = (props: {
//	 defaultValue?: any,
//	 onChange?: (newValue: any) => void,
// }) => {
//	 const onChange = (newValue: SType) => {
//		 props.onChange && props.onChange(new SArray({ subtype: newValue }))
//	 }
//	 return (
//		 <TypeSelector defaultValue={props.defaultValue && props.defaultValue.subtype} onChange={onChange}/>
//	 )
// }
