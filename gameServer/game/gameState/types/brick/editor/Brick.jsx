import { useState, useEffect, useCallback, useRef } from 'react';
import { Handle, Position } from 'react-flow-renderer';
import { notif } from '../../../../components/notification';
import { useProject } from '../../../../contexts/project';
import { Tooltip, Button, Input } from 'antd';
import { CommentOutlined, DashOutlined, CloseOutlined} from '@ant-design/icons';
const { TextArea } = Input;

function Comment(props) {
	const [ visible, setVisible ] = useState(props.showAllComments && props.comment)
	let Icon = props.comment ? CommentOutlined : DashOutlined;
	let iconStyle = visible ? { color: 'yellow' } : undefined;

	const toggleVisibility = () => {
		setVisible(!visible);
	}

	return <>
		<Button size='small' shape='round' className='comment-button' onClick={toggleVisibility}>
			<Icon style={iconStyle}/>
		</Button>
		{visible && <div className='comment'>
			<div>Comment</div>
			<TextArea 
				autoSize
				autoFocus
				className='comment-input' 
				placeholder='Enter comment' 
				defaultValue={props.comment}
				onChange={(event) => props.onChange(event.target.value)}
			/>
		</div>}
	</>
}

function BrickName(props) {
	if (props.onDoubleClick) return <Tooltip title='Double click to open'>
		<div onDoubleClick={props.onDoubleClick} className="brick-name custom" style={props.titleStyle}>
			{props.name}
		</div>
	</Tooltip>;
	return <div className="brick-name" style={props.titleStyle}>
		{props.name}
	</div>;
}


export default function Brick(props) {
	let { projectId } = useProject();
	const hovered = useRef(false);

	const brick = props.data.brick;
	const brickLibrary = props.data.brickLibrary;

	// validation
	let errorBrick = false;
	let brickSignature = brickLibrary[brick.lib][brick.func];
	if (!brickSignature) {
		brickSignature = brickLibrary[brick.lib].error;
		errorBrick = true;
	}
	if (brick.func === 'arg') {
		let argSignature = brickLibrary[brick.lib][`arg.${brick.params.name}`];
		if (!argSignature) {
			brickSignature = brickLibrary[brick.lib].error;
			errorBrick = true;
		}
	}

	let nestedParams = [];
	let inlineParams = [];
	brickSignature.params.forEach((param) => {
		if (param.type.brickType) nestedParams.push(param); // TODO appropriate check
		else inlineParams.push(param);
	});

	const onRemoveButtonClicked = () => {
		props.data.onRemoveButtonClicked(props.data.brickTree, props.data.parentBrick, props.data.paramCode);
	};

	const onChangeComment = (comment) => {
		brick.comment = comment ?? undefined;
		props.data.onChange()
	}

	const onDoubleClick = () => {
		let objId = brick.func.split('.')[1];
		window.open(`/${projectId}/template/customBricks/${objId}/brick`, '_blank', 'noopener');
	};

	const copy = () => {
		if (!hovered.current) return;
		let brickJson = JSON.stringify(props.data.brick);
		notif.success('Brick copied', brickJson.substring(0, 30) + '...');
		navigator.clipboard.writeText(brickJson);
	};


	const paste = (event) => {
		if (!hovered.current) return;
		let clipboardContents = event.clipboardData.getData('text');
		if (!clipboardContents) return;

		let pastedBrickTree = null;
		try {
			pastedBrickTree = JSON.parse(clipboardContents);
		} catch {
			notif.error('Brick paste failed', clipboardContents)
		}
		if (!pastedBrickTree) return; // TODO: add validation
		props.data.onPaste(pastedBrickTree, props.data.brickTree, props.data.parentBrick, props.data.paramCode);
	};

	const onPointerEnter = () => {
		hovered.current = true;
	}

	const onPointerLeave = () => {
		hovered.current = false;
	}

	useEffect(() => {
		document.addEventListener('paste', paste)
		document.addEventListener('copy', copy)
		return () => {
			document.removeEventListener('paste', paste)
			document.removeEventListener('copy', copy)
		}
	}, [])

	let width = Math.max(12, 1 + nestedParams.length * 5);
	
	return (
		<>
			<div
				className={`brick ${brickSignature.lib} ${brickSignature.func} ${props.data.fullscreen ? '' : 'small'} ${
					props.data.readonly ? 'readonly' : ''
				} ${errorBrick ? 'error' : ''}`}
				onPointerEnter={onPointerEnter}
				onPointerLeave={onPointerLeave}
				style={{ 
					minWidth: `${width}rem`,	
				}}
			>
				<div className='brick-header'>
					<BrickName name={brickSignature.name} onDoubleClick={onDoubleClick} titleStyle={{ maxWidth: `${width}rem` }}/>
					{!props.data.readonly && props.data.fullscreen && (
						<Button size='small' className='remove-button' onClick={onRemoveButtonClicked}>
							<CloseOutlined/>
						</Button>
					)}
				</div>
				<div className='brick-body'>
					<Comment 
						showAllComments={props.data.showAllComments}
						onChange={onChangeComment}
						comment={brick.comment}
					/>
					{inlineParams.map((param) => (
						<div className="field-container" key={param.code}>
							<div>{param.name}</div>
							<param.type.valueRender id={param.code}
								type={param.type}
								defaultValue={brick.params[param.code]}
								onChange={
									!param.readonly && !props.data.readonly
										? (value) => {
												brick.params[param.code] = value;
												props.data.onChange();
										  }
										: null
								}
							/>
						</div>
					))}
					{props.data.parentBrick && <Handle type="target" position={Position.Top} />}
					{nestedParams.map((param, index) => (
						<Handle
							id={`h${props.id}-${param.code}`}
							key={param.code}
							type="source"
							position={Position.Bottom}
							isConnectable={false}
							style={{
								left: Math.round(100 / nestedParams.length) * (index + 0.5) + '%',
								bottom: '-1.5rem',
							}}
						>
							<div className={'handle-label' + (props.data.readonly ? ' readonly' : '')}>{param.name}</div>
						</Handle>
					))}
				</div>
			</div>
		</>
	);
}
