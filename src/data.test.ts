import 'fake-indexeddb/auto';
import {describe,it,expect} from 'vitest';
import {load,save,validate,backup,samples,blank} from './data';
describe('真实持久化和备份',()=>{
 it('首次载入示例；编辑、删除、重新打开数据库后保留；清空后不重新填充',async()=>{expect((await load()).length).toBe(4);const d={...blank(),title:'测试记录',poster:'data:image/jpeg;base64,YQ==',watched:2};await save([d]);expect(await load()).toEqual([d]);await save([{...d,notes:'更新观后感',rating:9.2}]);expect((await load())[0].notes).toBe('更新观后感');await save([]);expect(await load()).toEqual([]);});
 it('JSON 往返保留海报和全部字段',()=>{const d={...samples[0],poster:'data:image/png;base64,YQ=='};expect(validate(JSON.parse(backup([d])))).toEqual([d]);});
 it('无效进度、评分、海报和重复编号被拒绝',()=>{for(const bad of [{...samples[0],watched:100},{...samples[0],rating:11},{...samples[0],poster:'javascript:alert(1)'},{...samples[0],year:NaN}])expect(()=>validate({version:1,dramas:[bad]})).toThrow();expect(()=>validate({version:1,dramas:[samples[0],samples[0]]})).toThrow();expect(()=>validate({version:5,dramas:[]})).toThrow();});
});
