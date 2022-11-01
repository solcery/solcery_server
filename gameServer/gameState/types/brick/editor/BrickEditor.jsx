import { useState, useEffect, useCallback, useRef } from 'react';
import ReactFlow, { isNode, useZoomPanHelper } from 'react-flow-renderer';
import AddBrickButton from './AddBrickButton';
import Brick from './Brick';
import LayoutHelper from './LayoutHelper';
import makeLayoutedElements from './dagreLayout';
import { notif } from '../../../../components/notification';
import './BrickEditor.scss';

let brickUniqueID = 0;

const nodeTypes = {
	add: AddBrickButton,
	brick: Brick,
};

export const BrickEditor = (props) => {
	let width = props.fullscreen ? window.innerWidth : 300;
	let height = props.fullscreen ? window.innerHeight : 200;

	const initialFit = useRef(false)
	const [state, setState] = useState({ elements: [], isLayouted: false });
	const [brickTree, setBrickTree] = useState(props.brickTree);
	const { fitView } = useZoomPanHelper();

	const onChangeBrickTree = useCallback(
		(bt) => {
			setBrickTree(bt);
			props.onChange && props.onChange(bt);
		},
		[props]
	);

	const addBrick = useCallback(
		(brickSignature, bt, parentBrick, paramID) => {
			if (!props.onChange) return;
			const brick = {
				lib: brickSignature.lib,
				func: brickSignature.func,
				params: {},
			};
			brickSignature.params.forEach((param) => {
				brick.params[param.code] = param.value ?? (param.type.default && param.type.default());
			});
			if (parentBrick) {
				parentBrick.params[paramID] = brick;
				onChangeBrickTree(JSON.parse(JSON.stringify(bt)));
			} else {
				onChangeBrickTree(brick);
			}
		},
		[props, onChangeBrickTree]
	);

	const removeBrick = useCallback(
		(bt, parentBrick, paramCode) => {
			if (!props.onChange) return;

			if (parentBrick) {
				parentBrick.params[paramCode] = null;
				onChangeBrickTree(JSON.parse(JSON.stringify(bt)));
			} else {
				onChangeBrickTree(null);
			}
		},
		[props, onChangeBrickTree]
	);

	const onPaste = useCallback(
		(pastedBrickTree, bt, parentBrick, paramCode) => {
			if (!props.onChange) return;
			if (parentBrick) {
				const brickSignature = props.brickLibrary[parentBrick.lib][parentBrick.func];
				const param = brickSignature.params.find((param) => param.code === paramCode);
				if (param.type.brickType === pastedBrickTree.lib) {
					parentBrick.params[paramCode] = pastedBrickTree;
					onChangeBrickTree(JSON.parse(JSON.stringify(bt)));
					notif.success('Pasted successfully');
				} else {
					notif.error('Paste failed', 'Incompatible brick types')
				}
			} else {
				if (pastedBrickTree.lib === props.brickType || props.brickType === 'any') {
					onChangeBrickTree(pastedBrickTree);
					notif.success('Pasted successfully');
				} else {
					notif.error('Paste failed', 'Incompatible brick types')
				}
			}
		},
		[props, onChangeBrickTree]
	);

	const makeAddButtonElement = useCallback(
		(brickID, brickType, brickTree, parentBrick, paramCode) => {
			return {
				id: brickID,
				type: 'add',
				position: { x: 0, y: 0 },
				data: {
					brickLibrary: props.brickLibrary,
					brickClass: props.brickClass,
					brickType,
					brickTree,
					parentBrick,
					paramCode,
					onBrickSubtypeSelected: addBrick,
					onPaste: onPaste,
					readonly: !props.onChange,
					fullscreen: props.fullscreen,
				},
			};
		},
		[props.brickLibrary, props.brickClass, addBrick, onPaste, props.fullscreen, props.onChange]
	);

	const makeAddButtonWithEdgeElements = useCallback(
		(brickID, brickType, brickTree, parentBrick, parentBrickID, paramCode) => {
			const elements = [makeAddButtonElement(brickID, brickType, brickTree, parentBrick, paramCode)];
			elements.push({
				id: `e${parentBrickID}-${brickID}`,
				source: parentBrickID,
				sourceHandle: `h${parentBrickID}-${paramCode}`,
				target: brickID,
				type: 'default',
			});
			return elements;
		},
		[makeAddButtonElement]
	);

	const makeBrickElement = useCallback(
		(brickID, brick, bt, parentBrick, paramCode) => {
			return {
				id: brickID,
				type: 'brick',
				position: { x: 0, y: 0 },
				data: { 
					...props, //??
					brick,
					parentBrick,
					brickTree,
					paramCode,
					onRemoveButtonClicked: removeBrick,
					onPaste: onPaste,
					onChange: props.onChange
						? () => {
								onChangeBrickTree(bt);
						  }
						: undefined,
					readonly: !props.onChange,
				},
			};
		},
		[
			props,
			brickTree,
			removeBrick,
			onPaste,
			onChangeBrickTree,
		]
	);

	const makeBrickWithEdgeElements = useCallback(
		(brickID, brick, brickTree, parentBrick, parentBrickID, paramID) => {
			const elements = [makeBrickElement(brickID, brick, brickTree, parentBrick, paramID)];
			if (parentBrickID) {
				elements.push({
					id: `e${parentBrickID}-${brickID}`,
					source: parentBrickID,
					sourceHandle: `h${parentBrickID}-${paramID}`,
					target: brickID,
					type: 'default',
				});
			}
			return elements;
		},
		[makeBrickElement]
	);

	const makeBrickTreeElements = useCallback(
		(brickTree) => {
			const elements = [];

			const processBrick = (brick, parentBrickID = null, parentBrick = null, paramCode = '') => {
				const brickID = Number(++brickUniqueID).toString();
				elements.push(...makeBrickWithEdgeElements(brickID, brick, brickTree, parentBrick, parentBrickID, paramCode));
				let brickSignature = props.brickLibrary[brick.lib][brick.func];
				if (!brickSignature) {
					return elements;
				}
				brickSignature.params.forEach((param) => {
					if (!param.type.brickType) return;

					const value = brick.params[param.code];
					if (value) {
						processBrick(value, brickID, brick, param.code);
					} else {
						const addButtonBrickID = Number(++brickUniqueID).toString();
						const addButtonElems = makeAddButtonWithEdgeElements(
							addButtonBrickID,
							param.type.brickType,
							brickTree,
							brick,
							brickID,
							param.code
						);
						elements.push(...addButtonElems);
					}
				});
			};
			processBrick(brickTree);

			return elements;
		},
		[props.brickLibrary, makeAddButtonWithEdgeElements, makeBrickWithEdgeElements]
	);

	const onNodeSizesChange = (nodeSizesByID) => {
		const rootNodePos = { x: width * 0.5, y: height * 0.1 };
		setState({
			elements: makeLayoutedElements(state.elements, nodeSizesByID, rootNodePos, isNode),
			isLayouted: true,
		});
	};

	useEffect(() => {
		let elements = null;
		if (brickTree) {
			elements = makeBrickTreeElements(brickTree);
		} else {
			elements = [makeAddButtonElement(Number(++brickUniqueID).toString(), props.brickType, null, null, 0)];
		}
		setState({ elements: elements, isLayouted: false });
		if (editorRef.current) {
			editorRef.current.style.visibility = 'hidden';
		}
	}, [brickTree, makeBrickTreeElements, makeAddButtonElement, props.brickType]);

	useEffect(() => {
		if (state.isLayouted && editorRef.current) {
			if (!initialFit.current) {
				initialFit.current = true;
				fitView();
				props.onElementLoad && props.onElementLoad(editorRef.current);
			}
			editorRef.current.style.visibility = 'visible';
		}
	}, [initialFit, state.isLayouted, fitView]);

	const editorRef = useRef(null);
	return (
		<div
			ref={editorRef}
			className="brick-editor"
			style={{
				width,
				height,
			}}
		>
			<ReactFlow
				nodeTypes={nodeTypes}
				elements={state.elements}
				nodesDraggable={false}
				nodesConnectable={false}
				selectNodesOnDrag={false}
				zoomOnDoubleClick={false}
				paneMoveable={props.fullscreen ? true : false}
				elementsSelectable={props.fullscreen ? true : false}
				zoomOnScroll={props.fullscreen ? true : false}
				zoomOnPinch={props.fullscreen ? true : false}
				minZoom={props.edit ? 0.4 : 0.001}
				maxZoom={1}
			>
				<LayoutHelper onNodeSizesChange={onNodeSizesChange} />
			</ReactFlow>
		</div>
	);
};

export default BrickEditor;
