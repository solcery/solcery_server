import { useState, useEffect, useRef } from 'react';
import { Handle, Position } from 'react-flow-renderer';
import { Select } from 'antd';

export default function AddBrickButton(props) {
	const hovered = useRef(false);

	const brickType = props.data.brickType; // TODO: type
	const brickLibrary = props.data.brickLibrary;
	const brickSignatures = [];
	if (brickType === 'any') {
		Object.values(brickLibrary).forEach((lib) => Object.values(lib).forEach(brick => {
			if (!brick.hidden) {
				brickSignatures.push(brick)
			}
		}));
	} else {
		let lib = brickLibrary[brickType];
		Object.values(lib).forEach(brick => {
			if (!brick.hidden) {
				brickSignatures.push(brick)
			}
		});
	}
	const [isNodeTypeSelectorVisible, setNodeTypeSelectorVisible] = useState(false);

	const onAddButtonPointerUp = (event) => {
		setNodeTypeSelectorVisible(true);
		event.stopPropagation();
	};

	const onSelectorPointerUp = (event) => {
		event.stopPropagation();
	};

	const onBrickSubtypeSelected = (index) => {
		const brickSignature = brickSignatures[index];
		console.log(brickSignature)
		props.data.onBrickSubtypeSelected(
			brickSignature,
			props.data.brickTree,
			props.data.parentBrick,
			props.data.paramCode
		);
		setNodeTypeSelectorVisible(false);
	};

	useEffect(() => {
		const onMouseUp = () => {
			setNodeTypeSelectorVisible(false);
		};
		window.addEventListener('pointerup', onMouseUp);
		return () => {
			window.removeEventListener('pointerup', onMouseUp);
		};
	}, []);

	const paste = async (event) => {
		if (!hovered.current) return;
		let clipboardContents = event.clipboardData.getData('text');
		if (!clipboardContents) return;

		let pastedBrickTree: any = null;
		try {
			pastedBrickTree = JSON.parse(clipboardContents);
		} catch {}
		if (!pastedBrickTree) return;
		props.data.onPaste(pastedBrickTree, props.data.brickTree, props.data.parentBrick, props.data.paramCode);
	}

	const onPointerEnter = () => {
		hovered.current = true;
	}

	const onPointerLeave = () => {
		hovered.current = false;
	}

	useEffect(() => {
		document.addEventListener('paste', paste)
		return () => {
			document.removeEventListener('paste', paste)
		}
	}, [])

	const selectorOptions = brickSignatures
		.map((sig, index) => ({
			value: index, 
			label: sig.name ,
		}));

	const filterOption = (input, option) => {
		return option.label.toLowerCase().includes(input.toLowerCase());
	}
	return (
		<>
			<div
				className={`add-brick-button ${!props.data.readonly && !props.data.small ? 'active' : ''}`}
				onPointerUp={onAddButtonPointerUp}
				onPointerEnter={onPointerEnter}
				onPointerLeave={onPointerLeave}
			>
				+
			</div>
			{props.data.parentBrick && <Handle type="target" position={Position.Top} />}
			{isNodeTypeSelectorVisible && (
				<div 
					className={`brick-selector ${brickType}`} 
					onPointerUp={onSelectorPointerUp}
				>
					<Select
						showSearch
						style={{
							width: 400,
						}}
						autoFocus
						defaultOpen
						placeholder="Search..."
						options={selectorOptions}
						dropdownMatchSelectWidth={false}
						onChange={onBrickSubtypeSelected}
						filterOption={filterOption}			
					/>
				</div>
			)}
		</>
	);
}
