import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useProject } from '../../../contexts/project';
import { useContent } from '../../../contexts/content';
import { useApi } from '../../../contexts/api';
import { Select } from 'antd';
const { Option } = Select;

const filterOption = (inputValue, option) => {
	return option.toLowerCase().includes(inputValue.toLowerCase());
}



export const ValueRender = (props) => {
	const [objects, setObjects] = useState(undefined);
	const { solceryAPI } = useApi();
	const { projectId } = useProject();
	const { content } = useContent();

	const loadObjects = (objs) => {
		let res = objs
			.filter(object => object.fields.name !== undefined)
			.map(object => ({
				id: object._id,
				title: object.fields.name,
			}));
		setObjects(res);
	}

	useEffect(() => {
		if (props.type.project) {
			solceryAPI.engine(props.type.project).template(props.type.templateCode).getObjects().then(loadObjects);
			return;
		} else {
			if (!content) return;
			let objs = content.objects.filter(obj => obj.template === props.type.templateCode)
			loadObjects(objs);
		}
	}, [ props.type, content ]);

	const onChange = (newValue) => {
		props.onChange && props.onChange(newValue);
	};

	if (!props.onChange) {
		if (!props.defaultValue) return <>None</>;
		if (!objects) return <>Loading ...</>;
		let obj = objects.find((obj) => obj.id === props.defaultValue);
		if (obj) {
			if (props.isFilter) {
				return <>{obj.title}</>;
			}
			return <Link to={`/${props.type.project ?? projectId}/template/${props.type.templateCode}/${props.defaultValue}`}>{obj.title}</Link>; //TODO
		} else {
			return <>{`Missing object ${props.defaultValue}`}</>;
		}
	}

	if (!objects) return <>Loading ...</>;
	return (
		<Select
			showSearch
			style={{
				width: 200,
			}}
			dropdownMatchSelectWidth={false}
			onChange={onChange}
			defaultValue={props.defaultValue}
			filterOption={(input, option) => option.children.toLowerCase().includes(input.toLowerCase())}
			filterSort={(optionA, optionB) => optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())}
		>
			<Option value={undefined}>None</Option>
			{objects.map(obj => (
				<Option key={obj.id} value={obj.id}>
					{obj.title}
				</Option>
			))}
		</Select>
	);
};
