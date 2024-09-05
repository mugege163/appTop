module.exports = {
    chainWebpack: config => {
      config.plugin('define').tap(args => {
        args[0]['process.env'].VUE_APP_EASYCOM = JSON.stringify({
          custom: /\^uview-ui\/components\/([\w-]+)$/,
          global: true,
          customPrefix: 'u'
        });
        return args;
      });
    },
    devServer: {
        open: true
       
      }
  };