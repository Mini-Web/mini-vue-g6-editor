import { registerEdge } from '@antv/g6';
import { uniqueId } from '@/utils';
const MIN_ARROW_SIZE = 3;

const customEdge = {
  init() {
    const dashArray = [
      [0, 1],
      [0, 2],
      [1, 2],
      [0, 1, 1, 2],
      [0, 2, 1, 2],
      [1, 2, 1, 2],
      [2, 2, 1, 2],
      [3, 2, 1, 2],
      [4, 2, 1, 2],
    ];

    const lineDash = [4, 2, 1, 2];
    const interval = 9;
    registerEdge('customEdge', {
      draw(_cfg, group) {
        let sourceNode, targetNode, start, end;
        if (typeof _cfg.source === 'string') {
          _cfg.source = _cfg.sourceNode;
        }
        if (!_cfg.start) {
          _cfg.start = {
            x: 0,
            y: 17,
          };
        }
        if (!_cfg.end) {
          _cfg.end = {
            x: 0,
            y: -17,
          };
        }
        if (!_cfg.source.x) {
          sourceNode = _cfg.source.getModel();
          start = {
            x: sourceNode.x + _cfg.start.x,
            y: sourceNode.y + _cfg.start.y,
          };
        } else {
          start = _cfg.source;
        }
        if (typeof _cfg.target === 'string') {
          _cfg.target = _cfg.targetNode;
        }
        if (!_cfg.target.x) {
          targetNode = _cfg.target.getModel();
          end = { x: targetNode.x + _cfg.end.x, y: targetNode.y + _cfg.end.y };
        } else {
          end = _cfg.target;
        }

        let path = [];
        let hgap = Math.abs(end.x - start.x);
        if (end.x > start.x) {
          path = [
            ['M', start.x, start.y],
            [
              'C',
              start.x,
              start.y + hgap / (hgap / 50),
              end.x,
              end.y - hgap / (hgap / 50),
              end.x,
              end.y - 4,
            ],
            ['L', end.x, end.y],
          ];
        } else {
          path = [
            ['M', start.x, start.y],
            [
              'C',
              start.x,
              start.y + hgap / (hgap / 50),
              end.x,
              end.y - hgap / (hgap / 50),
              end.x,
              end.y - 4,
            ],
            ['L', end.x, end.y],
          ];
        }
        let lineWidth = 1;
        lineWidth = lineWidth > MIN_ARROW_SIZE ? lineWidth : MIN_ARROW_SIZE;
        const width = (lineWidth * 10) / 3;
        const halfHeight = (lineWidth * 4) / 3;
        const radius = lineWidth * 4;
        const endArrowPath = [
          ['M', -width, halfHeight],
          ['L', 0, 0],
          ['L', -width, -halfHeight],
          ['A', radius, radius, 0, 0, 1, -width, halfHeight],
          ['Z'],
        ];
        const keyShape = group.addShape('path', {
          attrs: {
            id: 'edge' + uniqueId(),
            path: path,
            stroke: '#b8c3ce',
            lineAppendWidth: 10,
            endArrow: {
              path: endArrowPath,
            },
          },
        });
        return keyShape;
      },
      afterDraw(_cfg, group) {
        if (
          _cfg.source.getModel().isDoingStart &&
          _cfg.target.getModel().isDoingEnd
        ) {
          const shape = group.get('children')[0];
          const length = shape.getTotalLength(); // G 增加了 totalLength 的接口
          let totalArray = [];
          for (var i = 0; i < length; i += interval) {
            totalArray = totalArray.concat(lineDash);
          }
          let index = 0;
          shape.animate(
            {
              onFrame() {
                const _cfg = {
                  lineDash: dashArray[index].concat(totalArray),
                };
                index = (index + 1) % interval;
                return _cfg;
              },
              repeat: true,
            },
            3000
          );
        }
      },
      setState(name, value, item) {
        const group = item.getContainer();
        const shape = group.get('children')[0];
        const selectStyles = () => {
          shape.attr('stroke', '#6ab7ff');
        };
        const unSelectStyles = () => {
          shape.attr('stroke', '#b8c3ce');
        };

        switch (name) {
          case 'selected':
          case 'hover':
            if (value) {
              selectStyles();
            } else {
              unSelectStyles();
            }
            break;
        }
      },
    });
    registerEdge('link-edge', {
      draw(_cfg, group) {
        let sourceNode, targetNode, start, end;
        if (!_cfg.source.x) {
          sourceNode = _cfg.source.getModel();
          start = {
            x: sourceNode.x + _cfg.start.x,
            y: sourceNode.y + _cfg.start.y,
          };
        } else {
          start = _cfg.source;
        }
        if (!_cfg.target.x) {
          targetNode = _cfg.target.getModel();
          end = { x: targetNode.x + _cfg.end.x, y: targetNode.y + _cfg.end.y };
        } else {
          end = _cfg.target;
        }

        let path = [];
        path = [
          ['M', start.x, start.y],
          ['L', end.x, end.y],
        ];
        const keyShape = group.addShape('path', {
          attrs: {
            id: 'edge' + uniqueId(),
            path: path,
            stroke: '#1890FF',
            strokeOpacity: 0.9,
            lineDash: [5, 5],
          },
        });
        return keyShape;
      },
    });
  },
};

export default customEdge;
