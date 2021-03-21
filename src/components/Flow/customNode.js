import { registerNode } from '@antv/g6';
import { uniqueId } from '@/utils';
import { imageToBase64 } from '../../imageToBase64';

const customNode = {
  init() {
    registerNode('customNode', {
      draw(_cfg, group) {
        let size = _cfg.size;
        if (!size) {
          size = [170, 34];
        }
        // 此处必须是NUMBER 不然bbox不正常
        const width = parseInt(size[0]);
        const height = parseInt(size[1]);
        const color = _cfg.color;
        // 此处必须有偏移 不然drag-node错位
        const offsetX = -width / 2;
        const offsetY = -height / 2;
        const mainId = 'rect' + uniqueId();
        const shape = group.addShape('rect', {
          attrs: {
            id: mainId,
            x: offsetX,
            y: offsetY,
            width: width,
            height: height,
            stroke: '#ced4d9',
            fill: '#fff', //此处必须有fill 不然不能触发事件
            radius: 4,
          },
        });
        group.addShape('rect', {
          attrs: {
            x: offsetX,
            y: offsetY,
            width: 4,
            height: height,
            fill: color,
            parent: mainId,
            radius: [4, 0, 0, 4],
          },
        });
        if (_cfg.label) {
          group.addShape('text', {
            attrs: {
              id: 'label' + uniqueId(),
              x: offsetX + width / 2,
              y: offsetY + height / 2,
              textAlign: 'center',
              textBaseline: 'middle',
              text: _cfg.label,
              parent: mainId,
              fill: '#565758',
            },
          });
        }
        if (_cfg.inPoints) {
          for (let i = 0; i < _cfg.inPoints.length; i++) {
            let x,
              y = 0;
            //0为顶 1为底
            if (_cfg.inPoints[i][0] === 0) {
              y = 0;
            } else {
              y = height;
            }
            x = width * _cfg.inPoints[i][1];
            const id = 'circle' + uniqueId();
            group.addShape('circle', {
              attrs: {
                id: 'circle' + uniqueId(),
                parent: id,
                x: x + offsetX,
                y: y + offsetY,
                r: 10,
                isInPointOut: true,
                fill: '#1890ff',
                opacity: 0,
              },
            });
            group.addShape('circle', {
              attrs: {
                id: id,
                x: x + offsetX,
                y: y + offsetY,
                r: 3,
                isInPoint: true,
                fill: '#fff',
                stroke: '#1890ff',
                opacity: 0,
              },
            });
          }
        }
        if (_cfg.outPoints) {
          for (let i = 0; i < _cfg.outPoints.length; i++) {
            let x,
              y = 0;
            //0为顶 1为底
            if (_cfg.outPoints[i][0] === 0) {
              y = 0;
            } else {
              y = height;
            }
            x = width * _cfg.outPoints[i][1];
            const id = 'circle' + uniqueId();
            group.addShape('circle', {
              attrs: {
                id: 'circle' + uniqueId(),
                parent: id,
                x: x + offsetX,
                y: y + offsetY,
                r: 10,
                isOutPointOut: true,
                fill: '#1890ff',
                opacity: 0, //默認0 需要時改成0.3
              },
            });
            group.addShape('circle', {
              attrs: {
                id: id,
                x: x + offsetX,
                y: y + offsetY,
                r: 3,
                isOutPoint: true,
                fill: '#fff',
                stroke: '#1890ff',
                opacity: 0,
              },
            });
          }
        }
        //group.sort()
        // 添加文本、更多图形
        return shape;
      },
      async afterDraw(_cfg, group) {
        let size = _cfg.size;
        if (!size) {
          size = [170, 34];
        }
        // 此处必须是NUMBER 不然bbox不正常
        const width = parseInt(size[0]);
        const height = parseInt(size[1]);
        // 此处必须有偏移 不然drag-node错位
        const offsetX = -width / 2;
        const offsetY = -height / 2;
        const mainId = 'rect' + uniqueId();
        group.addShape('image', {
          attrs: {
            x: offsetX + 16,
            y: offsetY + 8,
            width: 20,
            height: 16,
            img: await imageToBase64(_cfg.image),
            parent: mainId,
          },
        });
        group.addShape('image', {
          attrs: {
            x: offsetX + width - 32,
            y: offsetY + 8,
            width: 16,
            height: 16,
            parent: mainId,
            img: await imageToBase64(_cfg.stateImage),
          },
        });
        if (_cfg.backImage) {
          const bgShape = group.addShape('image', {
            attrs: {
              x: offsetX,
              y: offsetY,
              width: width,
              height: height,
              img: await imageToBase64(_cfg.backImage),
            },
          });
          bgShape.setClip({
            type: 'rect',
            attrs: {
              x: offsetX,
              y: offsetY,
              width: width,
              height: height,
              fill: '#fff',
              radius: 4,
            },
          });
        }
      },
      //设置状态
      setState(name, value, item) {
        const group = item.getContainer();
        const shape = group.get('children')[0]; // 顺序根据 draw 时确定

        const children = group.findAll(g => {
          return g.attrs.parent === shape.attrs.id;
        });
        const circles = group.findAll(circle => {
          return circle.attrs.isInPoint || circle.attrs.isOutPoint;
        });
        const selectStyles = () => {
          shape.attr('fill', '#f3f9ff');
          shape.attr('stroke', '#6ab7ff');
          shape.attr('cursor', 'move');
          children.forEach(child => {
            child.attr('cursor', 'move');
          });
          circles.forEach(circle => {
            circle.attr('opacity', 1);
          });
        };
        const unSelectStyles = () => {
          shape.attr('fill', '#fff');
          shape.attr('stroke', '#ced4d9');
          circles.forEach(circle => {
            circle.attr('opacity', 0);
          });
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
  },
};

export default customNode;
