<template>
  <div class="toolbar">
    <link
      rel="stylesheet"
      type="text/css"
      href="//at.alicdn.com/t/font_598462_3xve1872wizzolxr.css"
    />
    <i
      class="command iconfont icon-undo"
      title="撤销"
      :class="undoList.length > 0 ? '' : 'disable'"
      @click="handleUndo"
    ></i>
    <i
      class="command iconfont icon-redo"
      title="重做"
      :class="redoList.length > 0 ? '' : 'disable'"
      @click="handleRedo"
    ></i>
    <span class="separator"></span>
    <!-- <i data-command="copy" class="command iconfont icon-copy-o disable" title="复制"></i>
    <i data-command="paste" class="command iconfont icon-paster-o disable" title="粘贴"></i>-->
    <i
      data-command="delete"
      class="command iconfont icon-delete-o"
      title="删除"
      :class="selectedItem ? '' : 'disable'"
      @click="handleDelete"
    ></i>
    <span class="separator"></span>
    <i
      data-command="zoomIn"
      class="command iconfont icon-zoom-in-o"
      title="放大"
      @click="handleZoomIn"
    ></i>
    <i
      data-command="zoomOut"
      class="command iconfont icon-zoom-out-o"
      title="缩小"
      @click="handleZoomOut"
    ></i>
    <i
      data-command="autoZoom"
      class="command iconfont icon-fit"
      title="适应画布"
      @click="handleAutoZoom"
    ></i>
    <i
      data-command="resetZoom"
      class="command iconfont icon-actual-size-o"
      title="实际尺寸"
      @click="handleResetZoom"
    ></i>
    <span class="separator"></span>
    <i
      data-command="toBack"
      class="command iconfont icon-to-back"
      :class="selectedItem ? '' : 'disable'"
      title="层级后置"
      @click="handleToBack"
    ></i>
    <i
      data-command="toFront"
      class="command iconfont icon-to-front"
      :class="selectedItem ? '' : 'disable'"
      title="层级前置"
      @click="handleToFront"
    ></i>
    <span class="separator"></span>
    <span class="separator"></span>
    <i
      data-command="multiSelect"
      class="command iconfont icon-select"
      :class="multiSelect ? 'disable' : ''"
      title="多选"
      @click="handleMuiltSelect"
    ></i>
    <i
      data-command="addGroup"
      class="command iconfont icon-group"
      title="成组"
      :class="addGroup ? '' : 'disable'"
      @click="handleAddGroup"
    ></i>
    <i
      data-command="unGroup"
      class="command iconfont icon-ungroup disable"
      title="解组"
    ></i>
    <el-button @click="consoleData" type="primary">控制台输出数据</el-button>
  </div>
</template>

<script>
import eventBus from "@/utils/eventBus";
import { Util } from "@antv/g6";
import { uniqueId } from "@/utils";
export default {
  data() {
    return {
      page: {},
      graph: {},
      redoList: [],
      undoList: [],
      editor: null,
      command: null,
      selectedItem: null,
      multiSelect: false,
      addGroup: false,
    };
  },
  created() {
    this.init();
    this.bindEvent();
  },
  watch: {
    selectedItem(val) {
      if (val && val.length > 1) {
        this.addGroup = true;
      } else {
        this.addGroup = false;
      }
    },
  },
  methods: {
    init() {
      const { editor, command } = this.$parent;
      this.editor = editor;
      this.command = command;
    },
    bindEvent() {
      let self = this;
      eventBus.$on("afterAddPage", (page) => {
        self.page = page;
        self.graph = self.page.graph;
      });
      eventBus.$on("add", (data) => {
        this.redoList = data.redoList;
        this.undoList = data.undoList;
      });
      eventBus.$on("update", (data) => {
        this.redoList = data.redoList;
        this.undoList = data.undoList;
      });
      eventBus.$on("delete", (data) => {
        this.redoList = data.redoList;
        this.undoList = data.undoList;
      });
      eventBus.$on("updateItem", (item) => {
        this.command.executeCommand("update", [item]);
      });
      eventBus.$on("addItem", (item) => {
        this.command.executeCommand("add", [item]);
      });
      eventBus.$on("nodeselectchange", () => {
        this.selectedItem = this.graph.findAllByState("node", "selected");
        this.selectedItem = this.selectedItem.concat(
          ...this.graph.findAllByState("edge", "selected")
        );
        console.log("487632", this.selectedItem);
      });
      eventBus.$on("deleteItem", () => {
        this.handleDelete();
      });
      eventBus.$on("muliteSelectEnd", () => {
        this.multiSelect = false;
        this.selectedItem = this.graph.findAllByState("node", "selected");
        console.log("432", this.selectedItem);
      });
    },
    handleUndo() {
      if (this.undoList.length > 0) this.command.undo();
    },
    handleRedo() {
      if (this.redoList.length > 0) this.command.redo();
    },
    handleDelete() {
      if (this.selectedItem.length > 0) {
        this.command.executeCommand("delete", this.selectedItem);
        this.selectedItem = null;
      }
    },
    getFormatPadding() {
      return Util.formatPadding(this.graph.get("fitViewPadding"));
    },
    getViewCenter() {
      const padding = this.getFormatPadding();
      const graph = this.graph;
      const width = this.graph.get("width");
      const height = graph.get("height");
      return {
        x: (width - padding[2] - padding[3]) / 2 + padding[3],
        y: (height - padding[0] - padding[2]) / 2 + padding[0],
      };
    },
    handleZoomIn() {
      const currentZoom = this.graph.getZoom();
      this.graph.zoomTo(currentZoom + 0.5, this.getViewCenter());
    },
    handleZoomOut() {
      const currentZoom = this.graph.getZoom();
      this.graph.zoomTo(currentZoom - 0.5, this.getViewCenter());
    },
    handleToBack() {
      if (this.selectedItem && this.selectedItem.length > 0) {
        this.selectedItem.forEach((item) => {
          item.toBack();
          this.graph.paint();
        });
      }
    },
    handleToFront() {
      if (this.selectedItem && this.selectedItem.length > 0) {
        this.selectedItem.forEach((item) => {
          if (item.getType() === "edge") {
            // const nodeGroup = this.graph.get("nodeGroup");
            // const edgeGroup = item.get("group");
            // nodeGroup.toFront();
            // edgeGroup.toFront()
          } else {
            item.toFront();
          }

          this.graph.paint();
        });
      }
    },
    handleAutoZoom() {
      this.graph.fitView(20);
    },
    handleResetZoom() {
      this.graph.zoomTo(1, this.getViewCenter());
    },
    handleMuiltSelect() {
      this.multiSelect = true;
      this.graph.setMode("mulitSelect");
    },
    handleAddGroup() {
      const comboId = "combo" + uniqueId();
      this.graph.createCombo(
        {
          id: comboId,
          label: comboId,
          type: "rect",
          style: {
            cursor: "pointer",
          },
        },
        this.selectedItem.map((item) => item._cfg.id)
      );
      this.addGroup = false;
    },

    consoleData() {
      console.log(this.graph.save());
    },
  },
};
</script>


<style scoped>
.toolbar {
  box-sizing: border-box;
  padding: 8px 0px;
  width: 100%;
  border: 1px solid #e9e9e9;
  height: 42px;
  z-index: 3;
  box-shadow: 0px 8px 12px 0px rgba(0, 52, 107, 0.04);
  position: absolute;
}
.toolbar .command:nth-of-type(1) {
  margin-left: 24px;
}
.toolbar .command {
  box-sizing: border-box;
  width: 27px;
  height: 27px;
  margin: 0px 6px;
  border-radius: 2px;
  padding-left: 4px;
  display: inline-block;
  border: 1px solid rgba(2, 2, 2, 0);
}
.toolbar .command:hover {
  cursor: pointer;
  border: 1px solid #e9e9e9;
}
.toolbar .disable {
  color: rgba(0, 0, 0, 0.25);
}
.toolbar .separator {
  margin: 4px;
  border-left: 1px solid #e9e9e9;
}
</style>