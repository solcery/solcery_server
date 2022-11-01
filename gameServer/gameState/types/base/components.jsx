export const DefaultFilterRender = (props) => {
	return (
		<props.type.valueRender
			type={props.type}
			defaultValue={props.defaultValue}
			onChange={props.onChange}
			onPressEnter={props.onPressEnter}
			isFilter={true}
		/>
	);
};
