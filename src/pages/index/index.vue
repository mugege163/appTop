<template>
	<view class="content">
		<view class="seach-box">
			<u-search :showAction="true" placeholder="Seach..." :animation="true" clearabled :inputStyle="inputStyle"
				prefixIconStyle="font-size: 18px;color: #909399" v-model="keyword" @search="showToast"
				@custom="showToast"></u-search>
		</view>
		<u-line></u-line>
		<scroll-view scroll-y="true" style="height: calc(100vh - 49px)">
			<view class="recommend-box">
				<text class="black-font"> Recommend </text>
				<u-scroll-list v-if="grossingapplist.length > 0">
					<view class="scroll-list" style="flex-direction: row">
						<view class="scroll-list__goods-item" v-for="(item, index) in grossingapplist" :key="index">
							<image lazy-load class="scroll-list__goods-item__image" :src="item['im:image'][2].label">
							</image>
							<text class="scroll-list__goods-item__text">{{
				item["im:name"].label
			}}</text>
							<text class="scroll-list__goods-item__subtext">{{
					item["category"].attributes.label
				}}</text>
						</view>
					</view>
				</u-scroll-list>
				<u-loading-icon text="加载中..." textSize="18" v-if="grossingapplist.length == 0"
					style="margin: 8vh"></u-loading-icon>
			</view>
			<u-line></u-line>
			<view class="free-box">
				<scroll-view scroll-y="true" style="height: auto"
					v-if="appDetails_arr.length > 0 && freeapplist.length > 0">
					<view class="scroll-view-item" v-for="(item, index) in freeapplist" :key="index">
						<text class="auto-id">
							{{ index + 1 }}
						</text>
						<image lazy-load :class="(index + 1) % 2 !== 0 ? 'free-img' : 'free-img-circle'"
							:src="item['im:image'][2].label"></image>
						<view class="free-sub">
							<text class="free-sub-text">
								{{ item["im:name"].label }}
							</text>
							<text class="free-sub-text">
								{{ item["category"].attributes.label }}
							</text>
							<view class="flex-line">
								<u-rate :allowHalf="true" active-color="#eaca5f" inactive-color="#b2b2b2" :count="5"
									:value="roundAverageUserRating(
				appDetails_arr[index].averageUserRating
			)
				" readonly></u-rate>
								<text class="count-t">
									{{ `(${appDetails_arr[index].userRatingCount})` }}
								</text>
							</view>
						</view>
					</view>
				</scroll-view>
				<u-loading-icon text="加载中..." textSize="18" v-if="appDetails_arr.length == 0 || freeapplist.length == 0"
					style="margin-top: 20vh"></u-loading-icon>
			</view>
		</scroll-view>
		<u-popup :show="show" :round="10" mode="bottom" @close="close" :closeable="true">
			<view class="free-box" style="height: 45vh;">
				<scroll-view scroll-y="true" style="height: 100%">
					<view class="scroll-view-item" v-for="(item, index) in searArr" :key="index">
						<text class="auto-id">
							{{ index + 1 }}
						</text>
						<image lazy-load :class="(index + 1) % 2 !== 0 ? 'free-img' : 'free-img-circle'"
							:src="item.artworkUrl100"></image>
						<view class="free-sub">
							<text class="free-sub-text">
								{{ item.trackCensoredName }}
							</text>
							<text class="free-sub-text">
								{{ item.description }}
							</text>
							<view class="flex-line">
								<u-rate :allowHalf="true" active-color="#eaca5f" inactive-color="#b2b2b2" :count="5"
									:value="roundAverageUserRating(item.averageUserRating)" readonly></u-rate>
								<text class="count-t">
									{{ `(${item.userRatingCount})` }}
								</text>
							</view>
						</view>
					</view>
				</scroll-view>
			</view>
		</u-popup>
	</view>
</template>

<script>
import Fuse from "fuse.js";
export default {
	data() {
		return {
			inputStyle: {
				backgroundColor: "#f4f4f4",
			},
			baseUrl_header: "https://itunes.apple.com/hk/",
			grossingapplist: [],
			freeapplist: [],
			appDetails_arr: [],
			keyword: "",
			allAppArr: [],
			fuse: null,
			show: false,
			searArr: [],
		};
	},
	mounted() {
		this.init_topgrossingapplist();
		this.init_freeapplist();
	},
	methods: {
		close() {
			this.show = false;
		},
		open_pop() {
			let resL = this.searArr.length
			if (resL > 0) {
				uni.showToast({
					title: `搜到相关${resL}个APP！`,
					duration: 2000,
				});
				this.show = true;
			} else {
				uni.showToast({
					title: "未搜索到相关APP！",
					duration: 2000,
					icon: "error",
				});
			}
		},
		showToast() {
			uni.showLoading({
				title: "搜索中...",
				mask: true,
			});
			let allLength = this.freeapplist.length + this.grossingapplist.length;
			if (
				this.allAppArr.length < allLength &&
				allLength > 0 &&
				this.grossingapplist.length > 0 &&
				this.freeapplist.length > 0
			) {
				let idStr = "",
					idArr = [];
				this.grossingapplist.forEach((item) => {
					idArr.push(item.id.attributes["im:id"]);
				});
				idStr = idArr.join(",");
				//this.init_appInfos(idStr);
				(async () => {
					let tenArr = await this.init_appInfos(idStr);
					this.allAppArr = [...tenArr, ...this.appDetails_arr];
					this.fuse = new Fuse(this.allAppArr, {
						keys: ["trackName", "sellerName", "description"], // 搜索的字段
						threshold: 0.4, // 匹配度阈值
						shouldSort: true, // 是否排序
					});
					this.searArr = this.fuse
						.search(this.keyword)
						.map((result) => result.item);
					uni.hideLoading();
					this.open_pop();
				})();
			} else if (
				this.allAppArr.length > 0 &&
				allLength == this.allAppArr.length
			) {
				this.searArr = this.fuse
					.search(this.keyword)
					.map((result) => result.item);
				uni.hideLoading();
				this.open_pop();
			} else {
				this.searArr = [];
				uni.showToast({
					title: "请稍后尝试！",
					duration: 2000,
				});
			}
		},
		init_topgrossingapplist(limit = 10) {
			uni.request({
				url: `${this.baseUrl_header}rss/topgrossingapplications/limit=${limit}/json`,
				success: (res) => {
					if (res.statusCode == 200) {
						this.grossingapplist = res.data.feed.entry;
					}
				},
			});
		},
		init_freeapplist(limit = 100) {
			uni.request({
				url: `${this.baseUrl_header}rss/topfreeapplications/limit=${limit}/json`,
				success: (res) => {

					if (res.statusCode == 200) {
						this.freeapplist = res.data.feed.entry;
						let idStr = "",
							idArr = [];
						this.freeapplist.forEach((item) => {
							idArr.push(item.id.attributes["im:id"]);
						});
						idStr = idArr.join(",");

						(async () => {
							this.appDetails_arr = await this.init_appInfos(idStr);
						})();
					}
				},
			});
		},
		init_appInfos(idStr) {
			return new Promise((resolve, reject) => {
				const callbackName = `jsonpCallback_${Date.now()}`;

				// 注册回调函数
				window[callbackName] = (data) => {

					resolve(data.results);
					delete window[callbackName]; // 清理回调函数
				};

				// 创建 script 标签并插入到文档中
				const script = document.createElement("script");
				script.src = `${this.baseUrl_header}lookup?id=${idStr}&callback=${callbackName}`;
				script.onerror = () => {
					reject(new Error("Failed to load script"));
				};
				document.head.appendChild(script);
			});
		},
		roundAverageUserRating(averageRating) {
			return parseFloat(averageRating.toFixed(2));
		},
	},
};
</script>

<style lang="scss">
.content {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;

	::v-deep .u-scroll-list__indicator {
		display: none !important;
	}

	.seach-box {
		width: 100%;
		padding: 15rpx;
	}

	.recommend-box {
		width: 100%;
		padding: 22rpx 0px 22rpx 28rpx;
	}

	.free-box {
		width: 100%;
		padding: 22rpx 28rpx 0 28rpx;
		height: auto;

		.scroll-view-item {
			height: 100px;
			position: relative;
			display: flex;
			align-items: center;
		}

		.scroll-view-item::after {
			content: "";
			position: absolute;
			left: 0;
			right: 0;
			bottom: 0;
			height: 0.5px;
			background-color: #d6d7d9;
		}

		.auto-id {
			color: #cfcfcf;
			font-size: 14px;
		}

		.free-img {
			width: 75px;
			height: 75px;
			border-radius: 16px;
			margin: 0 15px;
		}

		.free-img-circle {
			@extend .free-img;

			border-radius: 50%;
		}
	}

	.black-font {
		font-size: 35rpx;
		color: #000;
		margin-bottom: 20rpx;
		display: inline-block;
	}

	.free-sub-text {
		@extend .scroll-list__goods-item__text;
		width: calc(100vw - 160px) !important;
		text-align: left !important;
		padding: 0 !important;
		margin: 0 !important;
	}

	.free-sub-text:nth-child(2) {
		font-size: 28rpx;
		color: #c5c5c5;
	}

	.free-sub {
		display: flex;
		flex-direction: column;
		height: 70px;
		justify-content: space-between;
		margin-top: -5px;
	}

	.flex-line {
		display: flex;
		align-items: center;

		.count-t {
			font-size: 12px;
		}
	}
}

.scroll-list {
	@include flex(column);

	&__goods-item {
		margin-right: 15px;

		&__image {
			width: 100px;
			height: 100px;
			border-radius: 25px;
		}

		&__text {
			font-size: 35rpx;
			color: #000;
			text-align: center;
			padding: 0 15rpx;
			width: 100px;
			margin-top: 7px;
			display: inline-block;
			white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;
			box-sizing: border-box;
			max-height: 45rpx;
		}

		&__subtext {
			@extend .scroll-list__goods-item__text;

			color: #c5c5c5;
		}
	}
}
</style>
